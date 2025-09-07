// Vercel serverless entry that forwards any /api/* route to our Express app
const serverless = require('serverless-http');
const app = require('../src/app');

module.exports = serverless(app);
