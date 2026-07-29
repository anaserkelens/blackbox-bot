const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const { createDashboardMessagePayload } = require('./dashboardMessage');
const { colors, sendStructuredLog } = require('./structuredLog');
const { recordBotError } = require('./telemetry');

const defaultMailboxSchedulePath = path.join(__dirname, '..', 'data', 'scheduled-mailbox.json');
let mutationQueue = Promise.resolve();
let schedulerTimer = null;
let schedulerRunning = false;

function getMailboxScheduleStorageInfo(config) {
  if (config.dashboard.mailboxSchedulePath) {
    return {
      filePath: config.dashboard.mailboxSchedulePath,
      persistent: true,
      source: 'MAILBOX_SCHEDULE_PATH',
    };
  }

  if (config.dashboard.railwayVolumeMountPath) {
    return {
      filePath: path.join(config.dashboard.railwayVolumeMountPath, 'scheduled-mailbox.json'),
      persistent: true,
      source: 'RAILWAY_VOLUME_MOUNT_PATH',
    };
  }

  if (config.dashboard.savedMessagesPath) {
    return {
      filePath: path.join(path.dirname(config.dashboard.savedMessagesPath), 'scheduled-mailbox.json'),
      persistent: true,
      source: 'DASHBOARD_SAVED_MESSAGES_PATH directory',
    };
  }

  return {
    filePath: defaultMailboxSchedulePath,
    persistent: false,
    source: 'app filesystem',
  };
}

async function createScheduledMailboxPost(config, input) {
  const source = input && typeof input === 'object' ? input : {};
  const scheduledAt = new Date(source.scheduledAt);
  const now = Date.now();

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error('Choose a valid date and time.');
  }

  if (scheduledAt.getTime() < now + 5000) {
    throw new Error('Schedule the post at least five seconds in the future.');
  }

  if (scheduledAt.getTime() > now + 366 * 24 * 60 * 60 * 1000) {
    throw new Error('Mailbox posts can be scheduled up to one year ahead.');
  }

  const payload = cloneJson(source.payload);
  const channelId = String(
    source.channelId || payload.channelId || config.channels.mailbox || '',
  ).trim();

  if (!/^\d{17,20}$/.test(channelId)) {
    throw new Error('Choose a valid Discord channel for this Mailbox post.');
  }

  createDashboardMessagePayload(payload, config);

  return mutateSchedule(config, (store) => {
    const pendingCount = store.jobs.filter((job) =>
      ['scheduled', 'publishing', 'failed'].includes(job.status)).length;

    if (pendingCount >= 50) {
      throw new Error('The Mailbox queue can hold up to 50 pending posts.');
    }

    const job = {
      id: crypto.randomUUID(),
      title: normalizeText(source.title, 240) || 'Untitled Mailbox post',
      channelId,
      scheduledAt: scheduledAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'scheduled',
      attempts: 0,
      nextAttemptAt: scheduledAt.toISOString(),
      lastError: '',
      sentAt: null,
      messageId: null,
      url: null,
      payload,
    };

    store.jobs.unshift(job);
    pruneSchedule(store);
    return cloneJson(job);
  });
}

async function listScheduledMailboxPosts(config) {
  const store = await readSchedule(config);

  return [...store.jobs]
    .sort((left, right) => {
      const statusOrder = { publishing: 0, scheduled: 1, failed: 2, sent: 3 };
      const orderDifference = (statusOrder[left.status] ?? 9) - (statusOrder[right.status] ?? 9);

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return new Date(left.scheduledAt) - new Date(right.scheduledAt);
    })
    .map(withoutPayload);
}

async function deleteScheduledMailboxPost(config, jobId) {
  return mutateSchedule(config, (store) => {
    const index = store.jobs.findIndex((job) => job.id === jobId);

    if (index === -1) {
      return { status: 'not_found' };
    }

    if (store.jobs[index].status === 'publishing') {
      return { status: 'publishing', job: withoutPayload(store.jobs[index]) };
    }

    const [job] = store.jobs.splice(index, 1);
    return { status: 'deleted', job: withoutPayload(job) };
  });
}

async function startMailboxScheduler(client, config) {
  if (schedulerTimer) {
    return schedulerTimer;
  }

  await recoverPublishingJobs(config);
  runMailboxSchedulerTick(client, config).catch((error) => {
    recordBotError('Mailbox scheduler startup', error);
  });

  schedulerTimer = setInterval(() => {
    runMailboxSchedulerTick(client, config).catch((error) => {
      recordBotError('Mailbox scheduler tick', error);
    });
  }, 5000);
  schedulerTimer.unref?.();
  return schedulerTimer;
}

async function runMailboxSchedulerTick(client, config, now = new Date()) {
  if (schedulerRunning || !client.isReady()) {
    return [];
  }

  schedulerRunning = true;

  try {
    const jobs = await claimDueJobs(config, now);
    const results = [];

    for (const job of jobs) {
      results.push(await publishScheduledJob(client, config, job));
    }

    return results;
  } finally {
    schedulerRunning = false;
  }
}

async function claimDueJobs(config, now) {
  return mutateSchedule(config, (store) => {
    const due = store.jobs.filter((job) => {
      if (!['scheduled', 'failed'].includes(job.status) || job.attempts >= 3) {
        return false;
      }

      return new Date(job.nextAttemptAt || job.scheduledAt).getTime() <= now.getTime();
    });

    for (const job of due) {
      job.status = 'publishing';
      job.updatedAt = new Date().toISOString();
    }

    return cloneJson(due);
  });
}

async function publishScheduledJob(client, config, job) {
  try {
    const channelId = job.channelId || config.channels.mailbox;
    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel || typeof channel.isSendable !== 'function' || !channel.isSendable()) {
      throw new Error('The selected Mailbox channel is unavailable or not sendable.');
    }

    const payload = createDashboardMessagePayload(job.payload, config);
    const message = await channel.send(payload);
    const completed = await mutateSchedule(config, (store) => {
      const storedJob = store.jobs.find((item) => item.id === job.id);

      if (!storedJob) {
        return null;
      }

      storedJob.status = 'sent';
      storedJob.sentAt = new Date().toISOString();
      storedJob.updatedAt = storedJob.sentAt;
      storedJob.messageId = message.id;
      storedJob.url = message.url;
      storedJob.lastError = '';
      pruneSchedule(store);
      return withoutPayload(storedJob);
    });

    await sendStructuredLog(client, config.channels.operationLog, {
      title: 'Scheduled Mailbox Post Published',
      emoji: '📬',
      color: colors.success,
      summary: `**${job.title}** was published automatically in <#${channelId}>.`,
      referenceId: `MAILBOX-SCHEDULED-${job.id}`,
      links: message.url ? [{ label: 'Open Message', url: message.url }] : [],
      fields: [
        { name: 'Scheduled For', value: `<t:${Math.floor(new Date(job.scheduledAt).getTime() / 1000)}:F>` },
        { name: 'Message ID', value: message.id },
      ],
    }, config);

    return { status: 'sent', job: completed };
  } catch (error) {
    recordBotError(`Scheduled Mailbox: ${job.title}`, error);
    const failed = await mutateSchedule(config, (store) => {
      const storedJob = store.jobs.find((item) => item.id === job.id);

      if (!storedJob) {
        return null;
      }

      storedJob.attempts += 1;
      storedJob.status = 'failed';
      storedJob.lastError = normalizeText(error.message, 500);
      storedJob.updatedAt = new Date().toISOString();
      storedJob.nextAttemptAt = storedJob.attempts < 3
        ? new Date(Date.now() + 60000).toISOString()
        : null;
      return withoutPayload(storedJob);
    });

    return { status: 'failed', job: failed };
  }
}

async function recoverPublishingJobs(config) {
  return mutateSchedule(config, (store) => {
    for (const job of store.jobs) {
      if (job.status === 'publishing') {
        job.status = 'scheduled';
        job.nextAttemptAt = new Date().toISOString();
        job.updatedAt = job.nextAttemptAt;
      }
    }
  });
}

async function mutateSchedule(config, mutator) {
  const task = mutationQueue.then(async () => {
    const store = await readSchedule(config);
    const result = await mutator(store);

    await writeSchedule(config, store);
    return result;
  });

  mutationQueue = task.catch(() => null);
  return task;
}

async function readSchedule(config) {
  const { filePath } = getMailboxScheduleStorageInfo(config);
  let parsed;

  try {
    parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    version: 1,
    jobs: Array.isArray(parsed?.jobs)
      ? parsed.jobs.map(normalizeStoredJob).filter(Boolean)
      : [],
  };
}

async function writeSchedule(config, store) {
  const { filePath } = getMailboxScheduleStorageInfo(config);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2));
  await fs.rename(temporaryPath, filePath);
}

function normalizeStoredJob(input) {
  if (!input || typeof input !== 'object' || !input.id || !input.payload) {
    return null;
  }

  const status = ['scheduled', 'publishing', 'sent', 'failed'].includes(input.status)
    ? input.status
    : 'scheduled';

  return {
    id: String(input.id),
    title: normalizeText(input.title, 240) || 'Untitled Mailbox post',
    channelId: /^\d{17,20}$/.test(String(input.channelId || ''))
      ? String(input.channelId)
      : '',
    scheduledAt: normalizeDate(input.scheduledAt) || new Date().toISOString(),
    createdAt: normalizeDate(input.createdAt) || new Date().toISOString(),
    updatedAt: normalizeDate(input.updatedAt) || new Date().toISOString(),
    status,
    attempts: Math.max(0, Number.parseInt(input.attempts, 10) || 0),
    nextAttemptAt: normalizeDate(input.nextAttemptAt),
    lastError: normalizeText(input.lastError, 500),
    sentAt: normalizeDate(input.sentAt),
    messageId: input.messageId ? String(input.messageId) : null,
    url: normalizeText(input.url, 500) || null,
    payload: cloneJson(input.payload),
  };
}

function pruneSchedule(store) {
  const sentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  store.jobs = store.jobs
    .filter((job) => job.status !== 'sent' || new Date(job.sentAt || job.updatedAt).getTime() >= sentCutoff)
    .slice(0, 100);
}

function withoutPayload(job) {
  const { payload, ...summary } = job;
  return cloneJson(summary);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function normalizeText(value, maximumLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximumLength);
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

module.exports = {
  createScheduledMailboxPost,
  deleteScheduledMailboxPost,
  getMailboxScheduleStorageInfo,
  listScheduledMailboxPosts,
  runMailboxSchedulerTick,
  startMailboxScheduler,
};
