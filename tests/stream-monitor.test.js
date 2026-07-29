const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveStreamActions } = require('../utils/streamMonitorDelivery');
const {
  createDefaultStreamEmbedSettings,
  normalizeStreamEmbedSettings,
} = require('../utils/streamEmbedSettings');

const featuredUserId = '185282790969835520';
const config = {
  channels: { streamAnnouncements: '1520519675543293972' },
  streamMonitor: { featuredUserId },
};

test('stream delivery defaults preserve the existing featured-plus-role behavior', () => {
  const settings = createDefaultStreamEmbedSettings(config);

  assert.deepEqual(settings.delivery, {
    mode: 'featured_with_role',
    featuredUserId,
  });
  assert.deepEqual(resolveStreamActions('featured_with_role', true, true), {
    announce: true,
    assignRole: false,
  });
  assert.deepEqual(resolveStreamActions('featured_with_role', false, true), {
    announce: false,
    assignRole: true,
  });
});

test('stream delivery modes resolve announcements and roles independently', () => {
  assert.deepEqual(resolveStreamActions('all_announcements', false, true), {
    announce: true,
    assignRole: true,
  });
  assert.deepEqual(resolveStreamActions('featured_only', false, true), {
    announce: false,
    assignRole: false,
  });
  assert.deepEqual(resolveStreamActions('role_only', true, true), {
    announce: false,
    assignRole: true,
  });
  assert.deepEqual(resolveStreamActions('all_announcements', true, false), {
    announce: false,
    assignRole: false,
  });
});

test('featured stream modes require a valid selected Discord member', () => {
  const defaults = createDefaultStreamEmbedSettings(config);

  assert.throws(
    () => normalizeStreamEmbedSettings({
      ...defaults,
      delivery: {
        mode: 'featured_only',
        featuredUserId: '',
      },
    }, defaults),
    /Choose a featured Twitch creator/i,
  );

  const normalized = normalizeStreamEmbedSettings({
    ...defaults,
    delivery: {
      mode: 'all_announcements',
      featuredUserId: '',
      liveRoleId: '1520781346740506874',
    },
  }, defaults);

  assert.deepEqual(normalized.delivery, {
    mode: 'all_announcements',
    featuredUserId: '',
  });
});
