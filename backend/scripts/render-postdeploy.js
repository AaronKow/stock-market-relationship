#!/usr/bin/env node
const { execSync } = require('node:child_process');

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function asBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

try {
  console.log('Running Prisma migrate deploy...');
  run('npm run prisma:migrate:deploy');

  if (asBoolean(process.env.RENDER_RUN_SEED_ON_DEPLOY)) {
    console.log('RENDER_RUN_SEED_ON_DEPLOY=true, running db seed...');
    run('npm run db:seed');
  } else {
    console.log('Skipping db seed (set RENDER_RUN_SEED_ON_DEPLOY=true to enable).');
  }

  console.log('Post-deploy DB tasks completed.');
} catch (error) {
  console.error('Post-deploy DB tasks failed.');
  process.exit(error.status || 1);
}
