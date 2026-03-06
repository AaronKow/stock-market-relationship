const crypto = require('node:crypto');
const cors = require('cors');
const express = require('express');
const apiRouter = require('./routes/api');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { getConfig } = require('./config/env');

function createCorsOptions(config) {
  const allowlist = new Set([config.clientUrl]);

  if (config.nodeEnv === 'development') {
    allowlist.add('http://localhost:3000');
    allowlist.add('http://localhost:5173');
  }

  return {
    origin(origin, callback) {
      if (!origin || allowlist.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  };
}

function createApp() {
  const config = getConfig();
  const app = express();

  app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    next();
  });

  app.use(cors(createCorsOptions(config)));
  app.use(express.json());

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, config };
}

module.exports = {
  createApp,
};
