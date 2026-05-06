# Event Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### 2. User Login
**POST** `/auth/login`

Login with email and password to get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### 3. Get User Profile
**GET** `/auth/profile`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Event Endpoints

### 4. List Events
**GET** `/events`

Get paginated list of all events.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 10) - Items per page (max: 100)

**Example:**
```
GET /events?page=1&pageSize=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "event_id": 1,
      "event_name": "Annual Conference",
      "description": "Company annual conference",
      "start_date_time": "2024-12-01T09:00:00Z",
      "end_date_time": "2024-12-01T17:00:00Z",
      "address": "123 Main St, City",
      "event_for": "all",
      "image_url": "https://example.com/image.jpg",
      "is_deleted": false
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

### 5. Get Event Details
**GET** `/events/:eventId`

Get details of a specific event.

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "event_id": 1,
    "event_name": "Annual Conference",
    "description": "Company annual conference",
    "start_date_time": "2024-12-01T09:00:00Z",
    "end_date_time": "2024-12-01T17:00:00Z",
    "address": "123 Main St, City",
    "event_for": "all",
    "image_url": "https://example.com/image.jpg",
    "is_deleted": false
  }
}
```

---

### 6. Create Event (Admin Only)
**POST** `/events`

Create a new event (requires admin role).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "event_name": "Summer Festival",
  "description": "Annual summer festival",
  "start_date_time": "2024-06-15T10:00:00Z",
  "end_date_time": "2024-06-15T18:00:00Z",
  "address": "Central Park, City",
  "event_for": "all",
  "image_id": 1  // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event_id": 5,
    "event_name": "Summer Festival",
    ...
  }
}
```

---

### 7. Update Event (Admin Only)
**PUT** `/events/:eventId`

Update event details.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:** (all fields optional)
```json
{
  "event_name": "Updated Festival",
  "description": "Updated description",
  ...
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": { ... }
}
```

---

### 8. Delete Event (Admin Only)
**DELETE** `/events/:eventId`

Soft delete an event (marks is_deleted = true).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": { ... }
}
```

---

## Participant Endpoints

### 9. Get Participant
**GET** `/participants/:participantId`

Get participant details.

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "participant_id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "is_deleted": false
  }
}
```

---

### 10. Create Participant
**POST** `/participants`

Create a new participant.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Response (201/200):**
```json
{
  "success": true,
  "message": "Participant created successfully",
  "data": {
    "participant_id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  }
}
```

---

## Registration Endpoints

### 11. Register Participant to Event
**POST** `/registrations`

Register a participant for an event.

**Request Body:**
```json
{
  "event_id": 1,
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "participant_phone": "+1234567890",
  "organization": "ACME Corp",
  "designation": "Manager",
  "tssia_membership_id": "TSSIA123"  // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Participant registered successfully",
  "data": {
    "registration": {
      "registration_id": 1,
      "participant_id": 1,
      "event_id": 1,
      "organization": "ACME Corp",
      "designation": "Manager",
      "tssia_membership_id": "TSSIA123",
      "registration_status_id": 1
    },
    "pass": {
      "pass_id": 1,
      "pass_number": "PASS-K6XQBQ-A2B3C4D5"
    },
    "qr_code": {
      "qr_id": 1,
      "qr_code": "data:image/png;base64,..."
    }
  }
}
```

---

### 12. Get Registration
**GET** `/registrations/:registrationId`

Get registration details.

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "registration_id": 1,
    "participant_id": 1,
    "event_id": 1,
    "organization": "ACME Corp",
    "designation": "Manager",
    "tssia_membership_id": "TSSIA123",
    "registration_status_id": 1,
    "attendance_status_id": null,
    "is_deleted": false
  }
}
```

---

### 13. List Event Registrations
**GET** `/registrations/event/:eventId`

Get paginated list of registrations for an event.

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "registration_id": 1,
      "participant_id": 1,
      "event_id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "organization": "ACME Corp",
      "registration_status": "pending",
      "attendance_status": null
    }
  ],
  "pagination": { ... }
}
```

---

## Custom Fields Endpoints

### 14. Get Event Custom Fields
**GET** `/custom-fields/event/:eventId`

Get all custom fields for an event.

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "custom_id": 1,
      "event_id": 1,
      "field_name": "Company Name",
      "field_type": "text",
      "required": true
    },
    {
      "custom_id": 2,
      "event_id": 1,
      "field_name": "Department",
      "field_type": "dropdown",
      "required": true
    }
  ]
}
```

---

### 15. Create Event Custom Field (Admin Only)
**POST** `/custom-fields/event/:eventId`

Create a custom field for an event.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "field_name": "Company Name",
  "field_type": "text",
  "required": true
}
```

**Field Types:**
- text, textarea, number, email, phone
- dropdown, radio, checkbox
- date, time, file, url

**Response (201):**
```json
{
  "success": true,
  "message": "Custom field created successfully",
  "data": {
    "custom_id": 1,
    "event_id": 1,
    "field_name": "Company Name",
    "field_type": "text",
    "required": true
  }
}
```

---

### 16. Save Custom Field Responses
**POST** `/custom-fields/registration/:registrationId`

Save responses for custom fields.

**Request Body:**
```json
{
  "customFields": [
    {
      "custom_id": 1,
      "value": "ACME Corp"
    },
    {
      "custom_id": 2,
      "value": "Engineering"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Custom field responses saved successfully",
  "data": [ ... ]
}
```

---

### 17. Get Custom Field Responses
**GET** `/custom-fields/registration/:registrationId`

Get all custom field responses for a registration.

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "response_id": 1,
      "registration_id": 1,
      "custom_id": 1,
      "field_name": "Company Name",
      "field_type": "text",
      "value": "ACME Corp"
    }
  ]
}
```

---

## QR Code & Scanning Endpoints

### 18. Scan QR Code
**POST** `/scans/qr`

Scan a QR code and update attendance status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "qr_code": "data:image/png;base64,...",
  "event_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "QR code scanned successfully",
  "data": {
    "scan_log": {
      "log_id": 1,
      "event_id": 1,
      "registration_id": 1,
      "scanned_by": 5,
      "created_at": "2024-01-15T14:30:00Z"
    },
    "registration": {
      "registration_id": 1,
      "event_id": 1,
      "participant_id": 1
    }
  }
}
```

---

### 19. Get Scan Logs
**GET** `/scans/event/:eventId`

Get paginated scan logs for an event.

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "log_id": 1,
      "event_id": 1,
      "registration_id": 1,
      "scanned_by": 5,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "created_at": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Dashboard Endpoints

### 20. Get Dashboard Statistics (Admin Only)
**GET** `/dashboard/stats`

Get overall dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "summary": {
      "total_users": 150,
      "total_events": 25,
      "total_registrations": 500,
      "total_scans": 450
    },
    "registrations_by_status": [
      {
        "name": "pending",
        "count": 50
      },
      {
        "name": "confirmed",
        "count": 450
      }
    ],
    "attendance_by_status": [
      {
        "name": "present",
        "count": 450
      },
      {
        "name": null,
        "count": 50
      }
    ],
    "top_events": [
      {
        "event_id": 1,
        "event_name": "Annual Conference",
        "registration_count": 150
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email is required",
  "errors": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "errors": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "errors": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Event not found",
  "errors": null
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Participant is already registered for this event",
  "errors": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": null
}
```

---

## Rate Limiting
Currently, the API does not have rate limiting implemented. Consider adding it for production use.

## Pagination
All list endpoints support pagination with the following parameters:
- `page` - Page number (starts at 1)
- `pageSize` - Items per page (default: 10, max: 100)

---

## Status Types

### Registration Status
- pending
- confirmed
- cancelled

### Attendance Status
- present
- absent
- excused

---

## Event For Values
- `all` - Event for all participants
- `tssia_members` - Event only for TSSIA members

---

## Testing the API

Use tools like Postman or curl to test endpoints.

Example with curl:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Events
curl -X GET "http://localhost:5000/api/events?page=1&pageSize=10"
```

---

## Contact
For API questions or issues, contact the development team.
