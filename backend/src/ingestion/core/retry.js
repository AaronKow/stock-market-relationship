function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(task, {
  retries = 2,
  baseDelayMs = 500,
  maxDelayMs = 10_000,
  onRetry = () => {},
} = {}) {
  let attempt = 0;

  while (true) {
    try {
      return await task(attempt + 1);
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      const retryAfterMs = Number(error.retryAfterMs);
      const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const delayMs = Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? retryAfterMs : exponentialDelay;

      onRetry({
        attempt: attempt + 1,
        retries,
        delayMs,
        error,
      });

      await sleep(delayMs);
      attempt += 1;
    }
  }
}

module.exports = {
  withRetry,
  sleep,
};
