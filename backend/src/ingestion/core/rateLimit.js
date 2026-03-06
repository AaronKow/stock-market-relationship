const { sleep } = require('./retry');

function parseReset(value) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  if (numeric > 10_000_000_000) {
    return new Date(numeric);
  }

  if (numeric > 1_000_000_000) {
    return new Date(numeric * 1000);
  }

  return new Date(Date.now() + numeric * 1000);
}

class RateLimiter {
  constructor({ minIntervalMs = 0 } = {}) {
    this.minIntervalMs = minIntervalMs;
    this.lastRequestAt = 0;
    this.remaining = null;
    this.resetAt = null;
  }

  async throttle() {
    const now = Date.now();
    const waitMs = this.lastRequestAt + this.minIntervalMs - now;

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    if (this.remaining !== null && this.remaining <= 0 && this.resetAt) {
      const resetWaitMs = this.resetAt.getTime() - Date.now();
      if (resetWaitMs > 0) {
        await sleep(resetWaitMs);
      }
    }

    this.lastRequestAt = Date.now();
  }

  update(rateLimit = {}) {
    const { remaining, resetAt, headers } = rateLimit;

    if (Number.isFinite(remaining)) {
      this.remaining = remaining;
    } else if (headers?.['x-ratelimit-remaining']) {
      const parsed = Number(headers['x-ratelimit-remaining']);
      this.remaining = Number.isFinite(parsed) ? parsed : this.remaining;
    }

    const resolvedResetAt = resetAt || parseReset(headers?.['x-ratelimit-reset']) || parseReset(headers?.['retry-after']);
    if (resolvedResetAt) {
      this.resetAt = resolvedResetAt;
    }
  }

  snapshot() {
    return {
      remaining: this.remaining,
      resetAt: this.resetAt,
    };
  }
}

module.exports = {
  RateLimiter,
};
