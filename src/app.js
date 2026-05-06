import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.get('/api', (req, res) => {
  res.json({
    message: '✅ API is working correctly',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      events: '/api/events',
      participants: '/api/participants',
      registrations: '/api/registrations',
      customFields: '/api/custom-fields',
      scans: '/api/scans',
      dashboard: '/api/dashboard',
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
