import app from './app.js';
import { config } from './config/env.js';
import pool from './config/db.js';

const PORT = config.PORT;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🚀 Event Management System Backend               ║
║   ✅ Server running on port ${PORT}                ║
║   📍 Environment: ${config.NODE_ENV}               ║
║   📡 API: http://localhost:${PORT}/api             ║
║   🏥 Health: http://localhost:${PORT}/api/health   ║
╚═══════════════════════════════════════════════════╝
  `);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  / - Server health check');
  console.log('  GET  /api - API information');
  console.log('  GET  /api/health - Backend health');
  console.log('  GET  /api/events - List all events');
  console.log('  POST /api/auth/login - User login');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default server;
