function resolveStreamActions(mode, isFeaturedStreamer, isStreaming) {
  if (!isStreaming) {
    return { announce: false, assignRole: false };
  }

  switch (mode) {
    case 'all_announcements':
      return { announce: true, assignRole: true };
    case 'featured_only':
      return { announce: isFeaturedStreamer, assignRole: false };
    case 'role_only':
      return { announce: false, assignRole: true };
    case 'featured_with_role':
    default:
      return {
        announce: isFeaturedStreamer,
        assignRole: !isFeaturedStreamer,
      };
  }
}

module.exports = {
  resolveStreamActions,
};
