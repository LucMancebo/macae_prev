#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
  const { buildApp } = require('../../api/dist/src/app');
  const app = buildApp();
  await app.ready();
  const swagger = app.swagger();
  const outPath = path.resolve(__dirname, '..', '..', 'docs', 'openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(swagger, null, 2));
  console.log('OpenAPI JSON written to', outPath);
  await app.close();
}

main().catch(err => { console.error(err); process.exit(1); });
