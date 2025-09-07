require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

(async () => {
  try {
    await connectDB();

    const start = (port) => {
      const server = app
        .listen(port, () => {
          console.log(`Server running on port ${port}`);
        })
        .on('error', (err) => {
          if (err && err.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            console.warn(`Port ${port} in use, retrying on ${nextPort}...`);
            setTimeout(() => start(nextPort), 300);
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });

      // Graceful shutdown
      const shutdown = () => {
        console.log('Shutting down server...');
        server.close(() => {
          console.log('Server closed.');
          process.exit(0);
        });
      };
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    };

    start(DEFAULT_PORT);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
