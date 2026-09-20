import { app } from './app';
import { checkDbConnection, pool } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🔄 Initializing BK-Store Backend Server...');
  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    console.log('✅ Connected to PostgreSQL database with PGVector.');
  } else {
    console.log('ℹ️ Database is not available. Please start PostgreSQL container with `npm run db:up`.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} (http://localhost:${PORT})`);
    console.log(`📡 Healthcheck available at: http://localhost:${PORT}/api/health`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down server...');
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      await pool.end();
      console.log('🔒 Database pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
