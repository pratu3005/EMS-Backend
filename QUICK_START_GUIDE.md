# Quick Start Guide & Integration Checklist

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check
```bash
# Verify Node.js
node --version   # Should be v14+

# Verify PostgreSQL is running
psql --version   # Should show version

# Verify npm
npm --version    # Should be v6+
```

---

## 🚀 Setup in 5 Steps

### Step 1: Clone/Open Projects
```bash
# Backend
cd d:\EMS-Backend

# Frontend
cd d:\EMS-Frontend
```

### Step 2: Install Dependencies
```bash
# Terminal 1 - Backend
cd d:\EMS-Backend
npm install

# Terminal 2 - Frontend  
cd d:\EMS-Frontend
npm install
```

### Step 3: Configure Backend
```bash
cd d:\EMS-Backend
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# Save and close
```

### Step 4: Start Backend
```bash
cd d:\EMS-Backend
npm run dev

# Wait for: "✅ Server running on port 5000"
```

### Step 5: Start Frontend
```bash
cd d:\EMS-Frontend
npm run dev

# Wait for: "➜ Local: http://localhost:5173/"
```

**Done!** Access at http://localhost:5173

---

## ✅ Integration Checklist

### Pre-Integration
- [ ] Node.js v14+ installed
- [ ] PostgreSQL running
- [ ] Both projects cloned/downloaded
- [ ] .env file configured for backend

### Database Setup
- [ ] Database `ems_db` created
- [ ] All tables created (if manual setup)
- [ ] Sample data inserted (optional)
- [ ] Indexes created
- [ ] Foreign keys configured

### Backend Setup
- [ ] All npm packages installed
- [ ] .env file configured
- [ ] No missing environment variables
- [ ] Database connection test passed
- [ ] Server starts without errors

### Frontend Setup
- [ ] All npm packages installed
- [ ] .env file has API_URL set
- [ ] API service configured correctly
- [ ] Components loading without console errors
- [ ] Router working (navigation between pages)

### Integration Testing
- [ ] GET /api/health returns 200
- [ ] GET /api/events returns data
- [ ] POST /api/auth/register works
- [ ] POST /api/auth/login works
- [ ] Frontend can fetch events
- [ ] Frontend can register for event
- [ ] Pass and QR code generated
- [ ] Scan QR code functionality works

### Data Flow Verification
- [ ] User → Frontend → Backend → Database (create)
- [ ] Frontend → Backend → Database (read)
- [ ] Frontend → Backend → Database (update)
- [ ] Frontend → Backend → Database (delete)
- [ ] Registration creates participant
- [ ] Pass generates QR code
- [ ] Scan logs recorded in database

### Security Verification
- [ ] JWT tokens generated on login
- [ ] Protected routes require auth
- [ ] Admin routes check role
- [ ] CORS allows frontend origin
- [ ] Passwords hashed in database
- [ ] Sensitive data not logged

### API Documentation
- [ ] API_DOCUMENTATION_COMPLETE.md reviewed
- [ ] Swagger setup configured (optional)
- [ ] Postman collection imported
- [ ] Example requests tested
- [ ] Error responses understood

### Documentation Review
- [ ] README_COMPREHENSIVE.md read
- [ ] DATABASE_DOCUMENTATION.md reviewed
- [ ] INTEGRATION_AUDIT_REPORT.md reviewed
- [ ] Architecture understood
- [ ] Troubleshooting steps known

---

## 🔍 Verification Commands

### Backend Health Checks

**Check server is running:**
```bash
curl http://localhost:5000
# Expected: {"message": "🚀 Event Management System Backend", ...}
```

**Check database is connected:**
```bash
curl http://localhost:5000/api/health
# Expected: {"status": "✅ Backend is running", ...}
```

**Check API is accessible:**
```bash
curl http://localhost:5000/api
# Expected: {"message": "✅ API Router is working", ...}
```

### Database Health Checks

**Check database exists:**
```bash
psql -U postgres -l | grep ems_db
# Expected: Shows ems_db database
```

**Check tables exist:**
```bash
psql -U postgres -d ems_db -c "\dt"
# Expected: Lists all 11 tables
```

**Check connection:**
```bash
psql -U postgres -d ems_db -c "SELECT NOW();"
# Expected: Returns current timestamp
```

### Frontend Health Checks

**Check app loads:**
Visit http://localhost:5173 in browser
- [ ] Page loads without errors
- [ ] Console has no errors (F12)
- [ ] Events page shows data
- [ ] Navigation works

**Check API integration:**
Open browser console (F12):
```javascript
// Fetch events
fetch('http://localhost:5000/api/events')
  .then(r => r.json())
  .then(d => console.log(d))

// Expected: Array of events
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: User Registration → Login
```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Get JWT token from response

# 3. Login with same credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: User object + JWT token
```

### Scenario 2: Event Retrieval
```bash
# Fetch all events (no auth required)
curl http://localhost:5000/api/events

# Expected: Array of events with pagination
```

### Scenario 3: Event Registration
```bash
curl -X POST http://localhost:5000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "participant_name": "John Doe",
    "participant_email": "john@example.com",
    "participant_phone": "+1-555-0123",
    "event_id": 1,
    "organization": "Test Org",
    "designation": "Developer"
  }'

# Expected: Registration ID + Pass Number + QR Code
```

### Scenario 4: QR Code Scanning
```bash
# 1. Get pass details
curl http://localhost:5000/api/passes/1

# 2. Extract qr_code from response

# 3. Scan QR code (requires auth token)
curl -X POST http://localhost:5000/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "qr_code": "eyJyZWdpc3RyYXRpb25faWQiOjEyMywicGFzc19udW1iZXIiOiJQQVNTLTIwMjYwNTA4LUFCQzEyMyJ9"
  }'

# Expected: Attendance marked successfully
```

---

## 📊 Performance Baseline

### Response Time Targets (Development)
- GET /events: < 200ms
- GET /events/:id: < 100ms
- POST /registrations: < 300ms
- POST /scans: < 200ms
- GET /dashboard: < 500ms

### Database Query Performance
- Simple selects: < 10ms
- With joins: < 50ms
- Aggregations: < 100ms

### Frontend Performance
- Page load: < 2s
- API response handling: < 100ms
- Component render: < 100ms

---

## 🐛 Quick Troubleshooting

### Backend Won't Start
```
Error: ECONNREFUSED
→ PostgreSQL not running
→ Check .env database credentials
→ Verify PostgreSQL service

Error: Port 5000 in use
→ Change PORT in .env
→ Or kill process: lsof -ti:5000 | xargs kill -9
```

### Frontend Can't Connect to API
```
Error: CORS blocked
→ Check CORS_ORIGIN in backend .env
→ Verify frontend URL: http://localhost:5173
→ Restart backend after changing .env

Error: API not responding
→ Backend not running?
→ Check http://localhost:5000/api/health
→ Check console for network errors
```

### Database Issues
```
Error: Table does not exist
→ Create tables from schema
→ Check database name in .env
→ Run setup script

Error: Connection refused
→ PostgreSQL not running
→ Check connection credentials
→ Verify port 5432 available
```

### Authentication Issues
```
Error: Invalid token
→ Token expired (24h default)
→ Login again for new token
→ Check JWT_SECRET in .env

Error: Unauthorized
→ Token not sent in header
→ Format: Authorization: Bearer <token>
→ Check header spelling
```

---

## 📚 Documentation Files Reference

| File | Purpose | Read Time |
|------|---------|-----------|
| README_COMPREHENSIVE.md | Full setup guide | 20 min |
| API_DOCUMENTATION_COMPLETE.md | API reference | 15 min |
| DATABASE_DOCUMENTATION.md | Database schema | 15 min |
| INTEGRATION_AUDIT_REPORT.md | System verification | 10 min |

---

## 🚢 Deployment Checklist

Before deploying to production:

### Security
- [ ] Change JWT_SECRET to strong value
- [ ] Change DB_PASSWORD to strong value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Enable database backups
- [ ] Configure WAF if needed

### Performance
- [ ] Database backups configured
- [ ] Connection pooling optimized
- [ ] Caching strategy implemented
- [ ] CDN configured for static files
- [ ] Load testing completed

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring
- [ ] Database monitoring
- [ ] Application logging
- [ ] Alert system configured

### Testing
- [ ] All API endpoints tested
- [ ] User flows tested
- [ ] Edge cases tested
- [ ] Load testing completed
- [ ] Security audit completed

---

## 💡 Pro Tips

### During Development
- Use Postman for API testing
- Keep browser DevTools open for errors
- Check backend console for detailed logs
- Use `npm run dev` for auto-reload

### Debugging
```javascript
// Frontend: Check API call
console.log('API Response:', response);

// Backend: Check database query
console.log('Query:', text, 'Params:', params);

// Database: Check table contents
SELECT * FROM users LIMIT 5;
```

### Common Customizations
- Change JWT expiration in config/env.js
- Add rate limiting to routes
- Customize error messages in middleware
- Add logging to controllers
- Extend database schema for new features

---

## 📞 Support Resources

### Official Documentation
- Node.js: https://nodejs.org/docs/
- Express: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- React: https://react.dev/

### Community Help
- Stack Overflow (tag with technology)
- GitHub Issues (in repository)
- Discord communities
- Technical forums

---

**Setup Complete!** 🎉

Next Steps:
1. Review API_DOCUMENTATION_COMPLETE.md
2. Test all endpoints from Postman collection
3. Configure Swagger UI for interactive docs
4. Deploy to staging environment
5. Load test before production

---

**Last Updated**: May 8, 2026
