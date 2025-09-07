/*
  Newman runner for Event Karo API
  - Runs collection against chosen environment
  - Produces HTML and JSON reports in ./postman/reports
*/

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const newman = require('newman');

const COLLECTION = path.resolve(__dirname, 'Event-Karo-API.postman_collection.json');
const ENVIRONMENTS = {
  dev: path.resolve(__dirname, 'Event-Karo-Development.postman_environment.json'),
  prod: path.resolve(__dirname, 'Event-Karo-Production.postman_environment.json')
};

const envName = process.argv[2] || 'dev';
const envFile = ENVIRONMENTS[envName];
if (!envFile) {
  console.error(`Unknown environment: ${envName}. Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}`);
  process.exit(1);
}

const reportsDir = path.resolve(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

async function waitForHealth(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // Node 18+: global fetch
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // ignore until timeout
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  // Load environment and override baseUrl to use an ephemeral port to avoid conflicts
  const envJson = JSON.parse(fs.readFileSync(envFile, 'utf8'));
  const TEST_PORT = process.env.TEST_PORT || '5050';
  const baseUrl = `http://localhost:${TEST_PORT}`;

  if (Array.isArray(envJson.values)) {
    const baseVar = envJson.values.find(v => v.key === 'baseUrl');
    if (baseVar) baseVar.value = baseUrl;
    const apiVar = envJson.values.find(v => v.key === 'apiUrl');
    if (apiVar) apiVar.value = `${baseUrl}/api`;
  } else if (Array.isArray(envJson.variable)) {
    const baseVar = envJson.variable.find(v => v.key === 'baseUrl');
    if (baseVar) baseVar.value = baseUrl;
    const apiVar = envJson.variable.find(v => v.key === 'apiUrl');
    if (apiVar) apiVar.value = `${baseUrl}/api`;
  }

  // Start a fresh server just for this run
  console.log(`Starting test server on port ${TEST_PORT}...`);
  const serverProc = spawn(process.execPath, [path.resolve(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: TEST_PORT, NODE_ENV: 'test' },
    stdio: ['ignore', 'inherit', 'inherit']
  });

  const healthy = await waitForHealth(`${baseUrl}/api/health`, 30000);
  if (!healthy) {
    console.error('Test server failed to become healthy in time.');
    try { serverProc.kill('SIGINT'); } catch {}
    process.exit(1);
  }

  console.log('Test server is healthy. Running Newman...');
  newman.run({
    collection: require(COLLECTION),
    environment: envJson,
    reporters: ['cli', 'json', 'htmlextra'],
    reporter: {
      json: { export: path.join(reportsDir, `report-${envName}.json`) },
      htmlextra: { export: path.join(reportsDir, `report-${envName}.html`), darkTheme: true, title: `Event Karo API - ${envName}` }
    },
    timeoutRequest: 15000,
    insecure: false
  }, function (err, summary) {
    // Ensure server is stopped
    try { serverProc.kill('SIGINT'); } catch {}

    if (err) { console.error(err); process.exit(1); }
    const stats = summary.run.stats;
    const assertionFailures = stats.assertions && stats.assertions.failed ? stats.assertions.failed : 0;
    console.log(`\nCompleted with ${assertionFailures} failed assertions.`);
    process.exit(assertionFailures > 0 ? 1 : 0);
  });
})();
