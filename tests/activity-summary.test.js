const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { getActivityFeedSummary, recordActivity } = require('../utils/activityFeed');

async function makeConfig() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'activity-summary-'));
  return { dashboard: { activityPath: path.join(directory, 'activity-feed.json') } };
}

test('counts each type inside the window and ignores older items', async () => {
  const config = await makeConfig();
  const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  await recordActivity(config, { type: 'join', title: 'Ren joined' });
  await recordActivity(config, { type: 'join', title: 'Ash joined' });
  await recordActivity(config, { type: 'moderation', title: 'Case #4' });
  await recordActivity(config, { type: 'join', title: 'Ancient join', createdAt: old });

  const summary = await getActivityFeedSummary(config, { days: 7 });

  assert.equal(summary.join, 2);
  assert.equal(summary.moderation, 1);
  assert.equal(summary.mailbox, 0);
  assert.equal(summary.days, 7);
});

test('returns zeroes when no feed file exists yet', async () => {
  const summary = await getActivityFeedSummary(await makeConfig());

  assert.deepEqual(summary, { days: 7, join: 0, leave: 0, moderation: 0, mailbox: 0, voice: 0 });
});
