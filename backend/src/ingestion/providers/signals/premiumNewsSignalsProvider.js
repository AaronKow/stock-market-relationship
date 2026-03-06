function createPremiumNewsSignalsProvider() {
  const apiKey = process.env.PREMIUM_NEWS_API_KEY;

  return {
    name: 'premium-news-signals',
    source: 'Premium News Provider',
    entityType: 'signals',
    disabledReason: 'PREMIUM_NEWS_API_KEY not configured',
    minIntervalMs: 350,
    isEnabled() {
      return Boolean(apiKey);
    },
    async fetchPage({ cursor = null }) {
      if (!apiKey) {
        return {
          records: [],
          rawPayloads: [],
          hasMore: false,
          nextCursor: cursor,
        };
      }

      // Paid provider integration intentionally stubbed unless credentials are configured.
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
  createPremiumNewsSignalsProvider,
};
