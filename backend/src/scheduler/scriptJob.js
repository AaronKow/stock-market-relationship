const { spawn } = require('node:child_process');

function runNodeScript({ scriptPath, args = [], env = {} }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
        return;
      }

      reject(
        new Error(
          `Script failed with exit code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
        ),
      );
    });
  });
}

module.exports = {
  runNodeScript,
};
