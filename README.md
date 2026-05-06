# Event Management System - Backend

A production-ready Event Management System backend built with Node.js, Express, and PostgreSQL.

## Features

- ✅ JWT-based authentication with role-based access control
- ✅ Event management (CRUD operations)
- ✅ Participant registration system
- ✅ Custom dynamic form fields
- ✅ QR code generation and scanning
- ✅ Attendance tracking with scan logs
- ✅ Admin dashboard with analytics
- ✅ Password hashing with bcrypt
- ✅ Security with Helmet and CORS
- ✅ Comprehensive error handling
- ✅ Database transactions support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with pg (no ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **QR Code**: qrcode
- **Security**: Helmet, CORS
- **Environment**: dotenv

## Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd EMS-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your PostgreSQL credentials:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ems_db
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

The server will start on port 5000 by default.

## Project Structure

```
src/
├── config/
│   ├── db.js          # PostgreSQL connection pool
│   └── env.js         # Environment configuration
├── controllers/
│   ├── auth.controller.js        # User authentication
│   ├── event.controller.js       # Event management
│   ├── participant.controller.js # Participant management
│   ├── registration.controller.js # Registration logic
│   ├── customfield.controller.js # Custom fields
│   ├── scan.controller.js        # QR scanning
│   └── dashboard.controller.js   # Admin analytics
├── routes/
│   ├── auth.routes.js
│   ├── event.routes.js
│   ├── participant.routes.js
│   ├── registration.routes.js
│   ├── customfield.routes.js
│   ├── scan.routes.js
│   ├── dashboard.routes.js
│   └── index.js       # Route aggregation
├── middleware/
│   ├── auth.middleware.js    # JWT & role-based auth
│   └── errorHandler.js       # Error handling
├── services/
│   ├── auth.service.js       # JWT & password hashing
│   └── db.service.js         # Database queries
├── utils/
│   ├── response.js           # Response formatting
│   ├── validators.js         # Input validation
│   └── helpers.js            # Utility functions
├── app.js            # Express app setup
└── server.js         # Server startup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Events
- `GET /api/events` - List all events (paginated)
- `GET /api/events/:eventId` - Get event details
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:eventId` - Update event (admin only)
- `DELETE /api/events/:eventId` - Delete event (admin only)

### Participants
- `GET /api/participants/:participantId` - Get participant
- `POST /api/participants` - Create participant

### Registrations
- `POST /api/registrations` - Register participant to event
- `GET /api/registrations/:registrationId` - Get registration
- `GET /api/registrations/event/:eventId` - List event registrations (paginated)

### Custom Fields
- `GET /api/custom-fields/event/:eventId` - Get event custom fields
- `POST /api/custom-fields/event/:eventId` - Create custom field (admin only)
- `GET /api/custom-fields/registration/:registrationId` - Get custom field responses
- `POST /api/custom-fields/registration/:registrationId` - Save custom field responses

### QR Code Scanning
- `POST /api/scans/qr` - Scan QR code (authenticated)
- `GET /api/scans/event/:eventId` - Get scan logs (paginated)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)

## Database Schema

### Core Tables
- **users** - User accounts with roles
- **roles** - User roles (admin, user, verifier)
- **events** - Event information
- **images** - Event images
- **participants** - Participant information
- **event_registrations** - Registration records
- **status_master** - Status types (registration, attendance)
- **passes** - Physical/digital passes
- **qr_codes** - QR code data
- **scan_logs** - QR scan records
- **custom_fields** - Dynamic form fields
- **custom_field_responses** - Form responses

## Authentication Flow

1. User registers with email and password
2. Password is hashed with bcrypt and stored
3. User logs in with email and password
4. JWT token is generated and returned
5. Token is included in Authorization header: `Bearer <token>`
6. Token is verified on protected routes
7. User role is attached to request for authorization

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* optional error details */ }
}
```

Paginated responses:
```json
{
  "success": true,
  "message": "Success",
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

## Error Handling

The backend includes comprehensive error handling:
- Database constraint violations (duplicate, foreign key, not null)
- JWT errors (invalid, expired)
- Validation errors
- 404 not found errors
- 500 internal server errors

## Security Features

- **Helmet**: Sets HTTP headers for security
- **CORS**: Configured to allow frontend origin only
- **bcryptjs**: Password hashing with salt rounds
- **JWT**: Secure token-based authentication
- **Input Validation**: Email, phone, URL, datetime validation
- **Error Messages**: Generic messages to prevent information leakage

## Database Connection

The backend uses PostgreSQL connection pooling:
- Default pool size: 10
- Automatic connection reuse
- Error handling for idle clients
- Graceful shutdown with pool draining

## Running in Development

```bash
npm run dev
```

Uses nodemon to automatically restart on file changes.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DB_USER | PostgreSQL user | postgres |
| DB_PASSWORD | PostgreSQL password | password123 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | ems_db |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| JWT_SECRET | JWT secret key | your-secret-key |
| JWT_EXPIRE | Token expiration | 24h |
| CORS_ORIGIN | CORS allowed origin | http://localhost:5173 |

## API Usage Examples

### Register User
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

### Create Event (Admin)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "event_name": "Annual Conference",
    "description": "Company annual conference",
    "start_date_time": "2024-12-01T09:00:00Z",
    "end_date_time": "2024-12-01T17:00:00Z",
    "address": "123 Main St, City",
    "event_for": "all"
  }'
```

### Register Participant
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

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check credentials in .env file
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
Change PORT in .env file or kill the process using the port

### JWT Token Expired
- Token expires in 24 hours by default
- User needs to login again to get a new token
- Modify JWT_EXPIRE in .env to change expiration

### CORS Errors
- Ensure CORS_ORIGIN in .env matches frontend URL
- Check browser console for exact origin error

## Performance Optimizations

- Connection pooling for database
- Indexed queries on frequently accessed columns
- Pagination to reduce large data transfers
- JWT for stateless authentication
- Error caching to prevent duplicate queries

## Future Enhancements

- Email notifications for registrations
- File upload for custom fields
- Advanced reporting and exports
- Real-time event updates with WebSocket
- Rate limiting for API endpoints
- API key authentication for third-party access
- Audit logging for admin actions

## Support

For issues or questions, please check the logs or contact the development team.

## License

MIT
