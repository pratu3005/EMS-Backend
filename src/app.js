import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import pool from './config/db.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const PostgresStore = pgSession(session);

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session management
app.use(session({
  store: new PostgresStore({
    pool: pool,
    tableName: 'session'
  }),
  secret: config.JWT_SECRET, // Using JWT_SECRET as a fallback for session secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: config.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Debug routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Event Management System Backend',
    version: '1.0.0',
    status: 'running',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/api/health',
      api: '/api',
      events: '/api/events',
      auth: '/api/auth',
    },
  });
});

// API Routes
app.use('/api', routes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
