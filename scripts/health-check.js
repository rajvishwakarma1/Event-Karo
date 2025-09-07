// Lightweight health check for Docker
const http = require('http');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventkaro';

function checkHttp() {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: HOST, port: PORT, path: '/api/health', timeout: 4000 }, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) return resolve();
      reject(new Error('HTTP status ' + res.statusCode));
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('HTTP timeout')));
  });
}

async function checkMongo() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
    await client.db().admin().command({ ping: 1 });
  } finally {
    await client.close().catch(() => {});
  }
}

(async () => {
  try {
    await Promise.all([checkHttp(), checkMongo()]);
    process.exit(0);
  } catch (err) {
    console.error('Health check failed:', err.message);
    process.exit(1);
  }
})();
