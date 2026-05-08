# Event Management System - Complete Setup & Installation Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Project Structure](#project-structure)
9. [Database Schema](#database-schema)
10. [Authentication & Security](#authentication--security)
11. [Troubleshooting](#troubleshooting)
12. [Deployment](#deployment)
13. [Contributing](#contributing)

---

## Project Overview

**Event Management System (EMS)** is a full-stack application for managing events, participant registrations, QR code generation, and attendance tracking.

### Key Features
- ✅ User authentication with JWT and role-based access control
- ✅ Event management (CRUD operations)
- ✅ Participant registration system with duplicate prevention
- ✅ Dynamic custom form fields per event
- ✅ QR code generation and scanning
- ✅ Attendance tracking with scan logs
- ✅ Admin dashboard with analytics
- ✅ Password hashing with bcrypt
- ✅ Security with Helmet and CORS
- ✅ Database transactions support
- ✅ Comprehensive error handling
- ✅ Complete API documentation with Swagger/OpenAPI

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 12+ |
| Authentication | JWT (jsonwebtoken) |
| Password Security | bcryptjs |
| QR Code | qrcode npm package |
| Security | Helmet, CORS |
| Environment | dotenv |
| API Docs | Swagger UI Express |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                       │
│                  d:\EMS-Frontend (Port 5173)                     │
│                                                                   │
│  Components: Events, Registrations, Admin Dashboard, Login       │
│  Services: API integration with axios                            │
│  Storage: JWT token in localStorage                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
                           │ VITE_API_URL=http://localhost:5000/api
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                       │
│                d:\EMS-Backend (Port 5000)                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Routes Layer (/api)                                     │    │
│  │ - /auth, /events, /registrations, /scans, etc.         │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │ Controllers Layer                                       │    │
│  │ - Auth, Event, Registration, Scan, Dashboard, etc.     │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │ Services Layer                                          │    │
│  │ - Business logic, database operations, transactions     │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │ Middleware Layer                                        │    │
│  │ - Auth, CORS, Error Handling, Logging                  │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │ Utilities & Helpers                                     │    │
│  │ - Validators, Response formatters, QR/Pass generators  │    │
│  └────────────────┬────────────────────────────────────────┘    │
└────────────────┬─────────────────────────────────────────────────┘
                 │ PostgreSQL Driver (pg)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           PostgreSQL Database (ems_db)                           │
│                                                                   │
│ Tables: Users | Roles | Events | Participants | Registrations   │
│         Passes | QR_Codes | Scan_Logs | Custom_Fields | Status  │
│                                                                   │
│ Relationships: FK constraints, Cascade deletes, Indexes          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: v14+ (recommend v18+)
- **npm**: v6+ or yarn
- **PostgreSQL**: v12+ (running service)
- **RAM**: 2GB minimum (4GB+ recommended)
- **Disk Space**: 500MB for dependencies

### Installation Checklist
- [ ] Node.js installed and in PATH
- [ ] PostgreSQL installed and running
- [ ] npm or yarn available
- [ ] Git installed
- [ ] Port 5000 available for backend
- [ ] Port 5173 available for frontend
- [ ] Port 5432 available for PostgreSQL

### Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should be v14+

# Check npm version
npm --version   # Should be v6+

# Check PostgreSQL (psql)
psql --version  # Should be v12+
```

---

## Installation

### Step 1: Clone Repositories

**Backend:**
```bash
cd d:\EMS-Backend
```

**Frontend:**
```bash
cd d:\EMS-Frontend
```

### Step 2: Install Backend Dependencies

```bash
cd d:\EMS-Backend
npm install
```

**Dependencies installed:**
- express (web framework)
- pg (PostgreSQL client)
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)
- cors (cross-origin requests)
- helmet (security headers)
- dotenv (environment variables)
- qrcode (QR code generation)
- nodemon (dev environment)

### Step 3: Install Frontend Dependencies

```bash
cd d:\EMS-Frontend
npm install
```

**Dependencies installed:**
- react (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- bootstrap & react-bootstrap (UI components)
- vite (build tool)

### Step 4: Set Up Environment Variables

**Backend (.env):**
```bash
cd d:\EMS-Backend
cp .env.example .env
```

Edit `d:\EMS-Backend\.env`:
```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ems_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```bash
cd d:\EMS-Frontend
# .env already exists with correct configuration
cat .env
```

Expected content:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Set Up PostgreSQL Database

#### Option A: Using SQL Script (if available)

```bash
cd d:\EMS-Backend
psql -U postgres -f setup.sql
```

#### Option B: Manual Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ems_db;

# Connect to the new database
\c ems_db

# Create tables (see Database Schema section)
# Run all CREATE TABLE statements from schema file
```

#### Option C: Using Migration Scripts

If migration scripts are available in the project:
```bash
cd d:\EMS-Backend
node migrate.js
```

---

## Configuration

### Backend Configuration Files

**`src/config/env.js`**
- Loads environment variables from .env
- Validates required variables
- Exports configuration object

**`src/config/db.js`**
- Configures PostgreSQL connection pool
- Sets connection parameters
- Handles connection errors

### Frontend Configuration

**`vite.config.js`**
- Vite build configuration
- React plugin configuration
- Development server settings

**.env**
- API base URL: `http://localhost:5000/api`
- Can be changed for production

### Database Configuration

**Connection Pool Settings:**
- Min connections: 1
- Max connections: 10 (configurable)
- Connection timeout: 30s (configurable)
- Idle timeout: 30000ms (configurable)

To adjust pool settings, edit `src/config/db.js`:
```javascript
const poolConfig = {
  user: config.DB_USER,
  password: String(config.DB_PASSWORD || ''),
  host: config.DB_HOST,
  port: parseInt(config.DB_PORT, 10) || 5432,
  database: config.DB_NAME,
  max: 10,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

---

## Running the Application

### Development Mode

**Start Backend (Terminal 1):**
```bash
cd d:\EMS-Backend
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════════════╗
║   🚀 Event Management System Backend               ║
║   ✅ Server running on port 5000                  ║
║   📍 Environment: development                      ║
║   📡 API: http://localhost:5000/api               ║
║   🏥 Health: http://localhost:5000/api/health     ║
╚═══════════════════════════════════════════════════╝
```

**Start Frontend (Terminal 2):**
```bash
cd d:\EMS-Frontend
npm run dev
```

Expected output:
```
VITE v8.0.10  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Swagger Docs** (after setup): http://localhost:5000/api-docs

### Production Mode

**Build Frontend:**
```bash
cd d:\EMS-Frontend
npm run build
```

Output: `dist/` folder ready for deployment

**Start Backend (Production):**
```bash
cd d:\EMS-Backend
NODE_ENV=production npm start
```

---

## API Documentation

### Swagger/OpenAPI Setup

The backend includes Swagger UI for interactive API documentation.

**To enable Swagger:**

1. Install required package:
```bash
cd d:\EMS-Backend
npm install swagger-ui-express
```

2. Update `src/app.js`:
```javascript
import { setupSwagger } from './config/swagger.js';

// After mounting routes
setupSwagger(app);

// In app configuration
console.log('📚 Swagger Docs: http://localhost:5000/api-docs');
```

3. Restart the server:
```bash
npm run dev
```

4. Access Swagger UI:
```
http://localhost:5000/api-docs
```

### API Endpoints Summary

| Category | Endpoints | Details |
|----------|-----------|---------|
| **Auth** | POST /auth/register | User registration |
| | POST /auth/login | User login |
| | GET /auth/profile | Get profile (protected) |
| | GET /auth/users | List users (admin) |
| **Events** | GET /events | List all events |
| | POST /events | Create event (admin) |
| | GET /events/:id | Get event details |
| | PUT /events/:id | Update event (admin) |
| | DELETE /events/:id | Delete event (admin) |
| **Registrations** | POST /registrations | Register for event |
| | GET /registrations | List registrations |
| | GET /registrations/event/:id | Get event registrations |
| | PATCH /registrations/:id/status | Update status |
| **Scans** | POST /scans | Scan QR code (verifier) |
| **Passes** | GET /passes/:id | Get pass and QR code |
| **Dashboard** | GET /dashboard | Dashboard stats (admin) |
| **Health** | GET /health | Health check |

See `API_DOCUMENTATION_COMPLETE.md` for detailed endpoint documentation.

---

## Project Structure

```
EMS-Backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   ├── env.js             # Environment variables
│   │   └── swagger.js         # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── registration.controller.js
│   │   ├── participant.controller.js
│   │   ├── scan.controller.js
│   │   ├── pass.controller.js
│   │   ├── customfield.controller.js
│   │   └── dashboard.controller.js
│   ├── routes/
│   │   ├── index.js           # Route aggregation
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── registration.routes.js
│   │   ├── participant.routes.js
│   │   ├── scan.routes.js
│   │   ├── pass.routes.js
│   │   ├── customfield.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   ├── auth.service.js    # JWT & password functions
│   │   ├── db.service.js      # Database queries
│   │   └── registration.service.js  # Registration business logic
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT verification
│   │   └── errorHandler.js    # Error handling
│   └── utils/
│       ├── validators.js      # Input validation
│       ├── response.js        # Response formatting
│       ├── qr.js              # QR code utilities
│       ├── pass.js            # Pass generation
│       └── helpers.js         # Helper functions
├── .env.example               # Environment template
├── package.json
├── README.md
├── API_DOCUMENTATION_COMPLETE.md
└── INTEGRATION_AUDIT_REPORT.md

EMS-Frontend/
├── src/
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   ├── services/
│   │   └── api.js             # API service with axios
│   ├── component/
│   │   ├── login.jsx
│   │   ├── eventpage/         # Event pages
│   │   ├── Admin/             # Admin components
│   │   └── verifier/          # Verifier components
│   └── styles.css
├── public/                    # Static assets
├── .env                       # Environment variables
├── vite.config.js
├── package.json
└── index.html
```

---

## Database Schema

### Tables Overview

**Users Table**
```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(role_id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Events Table**
```sql
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date_time TIMESTAMP NOT NULL,
  end_date_time TIMESTAMP NOT NULL,
  address VARCHAR(255) NOT NULL,
  event_for VARCHAR(50),  -- 'all' or 'tssia_members'
  capacity INTEGER,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  category VARCHAR(100),
  additional_info TEXT,
  organizer_name VARCHAR(255),
  organizer_email VARCHAR(255),
  organizer_phone VARCHAR(20),
  organizer_role VARCHAR(100),
  image_id INTEGER,
  registration_fields JSONB DEFAULT '[]',
  success_page_config JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Event Registrations Table**
```sql
CREATE TABLE event_registrations (
  registration_id SERIAL PRIMARY KEY,
  participant_id INTEGER REFERENCES participants(participant_id),
  event_id INTEGER REFERENCES events(event_id),
  organization VARCHAR(255),
  designation VARCHAR(100),
  tssia_membership_id VARCHAR(100),
  registration_status_id INTEGER REFERENCES status_master(status_id),
  attendance_status_id INTEGER REFERENCES status_master(status_id),
  responses JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Other Key Tables**
- `participants` - Registered participants
- `passes` - Event passes with unique numbers
- `qr_codes` - QR codes linked to passes
- `scan_logs` - Attendance records
- `custom_fields` - Dynamic form fields per event
- `custom_field_responses` - Participant responses to custom fields
- `status_master` - Status lookup table

See `DATABASE_DOCUMENTATION.md` for complete schema details.

---

## Authentication & Security

### JWT Authentication Flow

```
1. User Registration
   POST /auth/register
   ├─ Validate input
   ├─ Check if email exists
   ├─ Hash password with bcryptjs
   ├─ Create user in database
   ├─ Generate JWT token
   └─ Return user + token

2. User Login
   POST /auth/login
   ├─ Validate credentials
   ├─ Find user by email
   ├─ Compare password hash
   ├─ Generate JWT token (24h expiry)
   └─ Return user + token

3. Protected Requests
   GET /auth/profile
   ├─ Extract token from Authorization header
   ├─ Verify token signature
   ├─ Decode user ID from token
   ├─ Fetch user from database
   └─ Return user data (attached to req.user)

4. Token Validation Errors
   ├─ No token → 401 Unauthorized
   ├─ Invalid token → 401 Unauthorized
   ├─ Expired token → 401 Token Expired
   └─ User not found → 404 User Not Found
```

### Password Security

- **Hashing Algorithm**: bcryptjs with 10 salt rounds
- **Password Requirements**: Minimum 6 characters
- **Storage**: Hashed in database, never stored plaintext
- **Verification**: Using bcryptjs.compare() for timing-safe comparison

### JWT Configuration

- **Secret**: Configured in `JWT_SECRET` environment variable
- **Expiration**: Configured in `JWT_EXPIRE` environment variable (default 24h)
- **Payload**: Contains user_id and email

### CORS Configuration

- **Allowed Origins**: `CORS_ORIGIN` environment variable
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization
- **Credentials**: Enabled

### Security Headers (Helmet)

```javascript
// Automatically enabled in app.js
app.use(helmet());

// Includes:
// - Content-Security-Policy
// - X-Frame-Options
// - X-Content-Type-Options
// - X-XSS-Protection
// - Strict-Transport-Security
```

### Input Validation

All endpoints validate input using custom validators:
```javascript
validateEmail(email)        // Valid email format
validatePassword(password)  // Min 6 characters
validatePhone(phone)        // Valid phone format
validateRequired(value)     // Non-empty check
validateDatetime(date)      // Valid ISO 8601 date
validateFieldType(type)     // Valid custom field type
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Error
**Error**: `ECONNREFUSED - connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
- Verify PostgreSQL is running:
  ```bash
  # Windows
  Get-Service | findstr postgres
  
  # macOS
  brew services list | grep postgres
  ```
- Check connection credentials in `.env`
- Verify database exists: `psql -U postgres -l | grep ems_db`

#### 2. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

#### 3. JWT Token Errors
**Error**: `Invalid token` or `Token expired`

**Solution**:
- Clear localStorage in browser: `localStorage.clear()`
- Login again to get new token
- Verify JWT_SECRET matches between registrations
- Check token expiration: `JWT_EXPIRE=24h` (or increase if needed)

#### 4. CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Verify frontend URL matches `CORS_ORIGIN` in `.env`
- Default: `http://localhost:5173`
- For different URL, update: `CORS_ORIGIN=http://yourfrontend.com`

#### 5. QR Code Generation Issues
**Error**: `Failed to generate QR code`

**Solution**:
- Verify qrcode package is installed: `npm ls qrcode`
- Check QR data isn't too large (max ~3KB encoded)
- Validate JSON encoding: `Buffer.from(data).toString('base64')`

#### 6. Duplicate Registration Error
**Error**: `Participant is already registered for this event`

**Solution**:
- This is intentional - prevents duplicate registrations
- To re-register: Change email or event ID
- For testing: Use unique email each time
- Admin can update status via `/registrations/:id/status`

#### 7. Frontend API Call Failures
**Error**: Network error or undefined API responses

**Solution**:
- Check API base URL in frontend: `src/services/api.js`
- Verify backend is running: `http://localhost:5000/api/health`
- Check browser console for detailed error messages
- Ensure `.env` has correct `VITE_API_URL`

#### 8. Database Migration Issues
**Error**: `Table does not exist` or `Column not found`

**Solution**:
- Verify all tables are created (see schema section)
- Drop and recreate database if needed:
  ```bash
  psql -U postgres
  DROP DATABASE ems_db;
  CREATE DATABASE ems_db;
  # Run creation scripts
  ```
- Check for missing indexes/foreign keys

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured for production
- [ ] Database backups configured
- [ ] SSL/HTTPS certificates ready
- [ ] API documentation up-to-date
- [ ] Security audit completed

### Environment Setup

**Production .env:**
```env
# Database
DB_USER=prod_user
DB_PASSWORD=strong_production_password
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_NAME=ems_db_prod

# Server
PORT=5000
NODE_ENV=production

# Security (CHANGE THESE!)
JWT_SECRET=generate_strong_random_secret_here
JWT_EXPIRE=24h

# CORS
CORS_ORIGIN=https://yourdomain.com

# SSL
USE_SSL=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### Backend Deployment

**Using PM2 (Recommended):**
```bash
npm install -g pm2

# Start
pm2 start src/server.js --name ems-backend

# Monitor
pm2 monit

# Logs
pm2 logs ems-backend

# Auto-start on reboot
pm2 startup
pm2 save
```

**Using Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Deployment

**Build for Production:**
```bash
npm run build
```

**Deploy to Web Server:**
```bash
# Upload dist/ folder to web server
# Configure web server to serve index.html for all routes
```

**Using Vercel/Netlify:**
```bash
# Install CLI
npm install -g vercel

# Deploy
vercel
```

### Database Backups

**Automated Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/ems"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump -U postgres ems_db | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Monitoring

**Application Monitoring:**
- Set up error tracking (Sentry, Rollbar)
- Enable database query logging
- Monitor API response times
- Set up uptime monitoring (Pingdom, Uptime Robot)

**Database Monitoring:**
- Monitor query performance
- Track connection pool usage
- Set up slow query alerts
- Regular backups verification

---

## Contributing

### Code Style
- Use ES6+ features
- Consistent indentation (2 spaces)
- Meaningful variable names
- Comments for complex logic

### Commit Message Format
```
[Type] Brief description

Detailed explanation if needed

Type: feature, fix, refactor, docs, test, chore
```

### Pull Request Process
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request with description
5. Address code review comments
6. Merge after approval

---

## Support & Documentation

### Documentation Files
- **README.md** (this file) - Setup and overview
- **API_DOCUMENTATION_COMPLETE.md** - Complete API reference
- **INTEGRATION_AUDIT_REPORT.md** - System audit and verification
- **DATABASE_DOCUMENTATION.md** - Database schema and ER diagram

### Getting Help
1. Check troubleshooting section above
2. Review documentation files
3. Check API documentation for endpoint details
4. Review code comments and error messages
5. Contact support team

---

## License
MIT

---

## Changelog

### Version 1.0.0 (May 8, 2026)
- Initial release
- All core features implemented
- Complete API documentation
- Full integration audit completed
- Production-ready status achieved

---

**Last Updated**: May 8, 2026  
**Maintainer**: EMS Development Team  
**Status**: ✅ Production Ready
