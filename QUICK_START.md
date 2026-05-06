# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies
```bash
cd EMS-Backend
npm install
```

### 2. Configure Database
Create `.env` file in the project root:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ems_db
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:5173
```

### 3. Start the Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   Event Management System Backend       ║
║   Server running on port 5000          ║
║   Environment: development              ║
╚════════════════════════════════════════╝
```

### 4. Test the Backend

Open a new terminal and test the health endpoint:
```bash
curl http://localhost:5000/
```

Response:
```json
{
  "message": "Event Management System Backend",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Common Tasks

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Events
```bash
curl http://localhost:5000/api/events?page=1&pageSize=10
```

### Register an Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Create an Event (Admin Only)
1. First login as admin to get token
2. Use the token in the Authorization header:

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d '{
    "event_name": "Tech Conference 2024",
    "description": "Annual tech conference",
    "start_date_time": "2024-12-15T09:00:00Z",
    "end_date_time": "2024-12-15T17:00:00Z",
    "address": "123 Tech Boulevard, City",
    "event_for": "all"
  }'
```

### Register Participant to Event
```bash
curl -X POST http://localhost:5000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "participant_name": "Jane Smith",
    "participant_email": "jane@example.com",
    "participant_phone": "+1234567890",
    "organization": "ACME Corp",
    "designation": "Manager"
  }'
```

---

## Connecting with Frontend

Update your frontend's API base URL:

In your frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Then use in your fetch calls:
```javascript
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/events`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## Database Requirements

Ensure your PostgreSQL database has all required tables:
- users
- roles
- events
- images
- participants
- event_registrations
- status_master
- passes
- qr_codes
- scan_logs
- custom_fields
- custom_field_responses

All tables should have proper foreign key constraints and indexes for optimal performance.

---

## Troubleshooting

### Port 5000 Already in Use
Change the PORT in `.env`:
```env
PORT=5001
```

### Cannot Connect to Database
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### CORS Errors
- Make sure frontend URL matches CORS_ORIGIN in `.env`
- Frontend running on port 5173? CORS_ORIGIN should be `http://localhost:5173`

### JWT Token Issues
- Token expires in 24 hours by default
- User needs to login again for new token
- Check JWT_SECRET is set in `.env`

---

## File Structure Overview

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
├── app.js           # Express app
└── server.js        # Server startup

Root files:
├── package.json
├── .env.example
├── README.md
└── API_DOCUMENTATION.md
```

---

## Next Steps

1. ✅ Backend is running
2. 🔗 Connect frontend to backend
3. 🗄️ Ensure database is configured
4. 🧪 Test all endpoints (see API_DOCUMENTATION.md)
5. 🚀 Deploy to production

---

## Help

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
For setup details, see [README.md](./README.md)
