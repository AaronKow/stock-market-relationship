function createSecSubmissionsProvider() {
  const userAgent = process.env.SEC_API_USER_AGENT;

  return {
    name: 'sec-submissions',
    source: 'SEC EDGAR Submissions',
    entityType: 'company_metadata',
    disabledReason: 'SEC_API_USER_AGENT not configured',
    minIntervalMs: 250,
    isEnabled() {
      return Boolean(userAgent);
    },
    async fetchPage({ cursor = null }) {
      if (!userAgent) {
        return {
          records: [],
          rawPayloads: [],
          hasMore: false,
          nextCursor: cursor,
        };
      }

      // Kept intentionally conservative: implement full SEC paging/workflow after env setup and provider selection.
      return {
        records: [],
        rawPayloads: [],
        hasMore: false,
        nextCursor: cursor,
      };
    },
  };
}

module.exports = {
  createSecSubmissionsProvider,
};
