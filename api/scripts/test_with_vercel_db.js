const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '..', 'docs', 'sensitive', 'VERCEL_ENV_VARS.secret.md');
console.log('Loading env from', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Could not load env file at', envPath, '\n', result.error);
  process.exit(1);
}

// Forward remaining args to jest
const args = ['jest', ...process.argv.slice(2)];
const proc = spawn('npx', args, { stdio: 'inherit', shell: true, env: process.env });
proc.on('exit', (code) => process.exit(code));
proc.on('error', (err) => { console.error(err); process.exit(1); });
