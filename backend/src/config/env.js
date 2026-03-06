const dotenv = require('dotenv');

dotenv.config();

const requiredKeys = ['PORT', 'DATABASE_URL', 'CLIENT_URL', 'NODE_ENV'];

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getConfig() {
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  return {
    port: Number(process.env.PORT),
    databaseUrl: process.env.DATABASE_URL,
    clientUrl: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV,
    enableScheduler: parseBoolean(process.env.ENABLE_SCHEDULER, true),
  };
}

module.exports = {
  getConfig,
};
