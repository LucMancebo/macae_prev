#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const net = require('net');
const path = require('path');

function waitForPort(host, port, timeoutMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      const socket = net.connect(port, host, () => {
        socket.destroy();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) return reject(new Error('timeout waiting for port'));
        setTimeout(check, 500);
      });
    })();
  });
}

async function main() {
  const root = path.resolve(__dirname, '..', '..');
  const apiDir = path.join(root, 'api');
  try {
    console.log('Starting docker-compose test DB...');
    execSync('docker compose -f docker-compose.test.yml up -d --remove-orphans', { cwd: root, stdio: 'inherit' });

    console.log('Waiting for Postgres on 127.0.0.1:15432...');
    await waitForPort('127.0.0.1', 15432);

    console.log('Postgres is up. Preparing schema with Prisma (db push)...');
    const dbUrl = 'postgresql://admin:admin123@127.0.0.1:15432/macaeprev_test';
    const env = Object.assign({}, process.env, { DATABASE_URL: dbUrl, DIRECT_URL: dbUrl });

    spawnSync('npx', ['prisma', 'db', 'push'], { cwd: apiDir, env, stdio: 'inherit' });

    console.log('Running tests...');
    const res = spawnSync('npm', ['test'], { cwd: apiDir, env, stdio: 'inherit' });
    const code = res.status || 0;

    console.log('Tests finished with code', code);
    console.log('Tearing down docker-compose test stack...');
    execSync('docker compose -f docker-compose.test.yml down -v', { cwd: root, stdio: 'inherit' });
    process.exit(code);
  } catch (err) {
    console.error('Error during test run:', err);
    try { execSync('docker compose -f docker-compose.test.yml down -v', { cwd: root, stdio: 'inherit' }); } catch (e) {}
    process.exit(1);
  }
}

main();
