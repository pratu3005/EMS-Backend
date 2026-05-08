# Event Management System - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response (200-201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Paginated Response
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

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": null
}
```

---

# API Endpoints

## 1. Authentication Routes (`/auth`)

### 1.1 Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "role": "user"
}
```

**Parameters:**
- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `username` (string, optional): Username for login
- `password` (string, required): Min 6 characters
- `role` (string, optional): "user" or "admin" (default: "user")

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Missing required fields, invalid email, weak password
- `409`: Email already exists

---

### 1.2 Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Parameters:**
- `email` (string, required): Registered email
- `password` (string, required): Account password

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
      "role": "user",
      "assigned_events": [
        {
          "event_id": 5,
          "event_name": "Annual Conference 2026",
          "description": "...",
          "start_date_time": "2026-06-15T09:00:00Z",
          "address": "Conference Center, NY"
        }
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### 1.3 Get User Profile
**GET** `/auth/profile`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
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
    "assigned_events": [],
    "created_at": "2026-05-08T10:30:00Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `404`: User not found

---

### 1.4 List All Users
**GET** `/auth/users`

Get all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role_name": "user",
      "assigned_events": []
    }
  ]
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Insufficient permissions (not admin)

---

### 1.5 Update Verifier Events
**PATCH** `/auth/users/:userId/events`

Assign events to a verifier user (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "eventIds": [1, 2, 5]
}
```

**Parameters:**
- `userId` (number, path): Target user ID
- `eventIds` (array, required): Array of event IDs to assign

**Response (200):**
```json
{
  "success": true,
  "message": "User events updated successfully",
  "data": null
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Insufficient permissions
- `400`: Invalid event IDs

---

### 1.6 Remove User
**DELETE** `/auth/users/:userId`

Soft delete a user (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `userId` (number, path): User ID to delete

**Response (200):**
```json
{
  "success": true,
  "message": "User removed successfully",
  "data": null
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Insufficient permissions

---

## 2. Events Routes (`/events`)

### 2.1 List Events
**GET** `/events`

Get paginated list of all events.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page, max 100 (default: 10)

**Example:**
```
GET /events?page=1&pageSize=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "event_id": 1,
      "event_name": "Annual Gala 2026",
      "description": "Join us for an evening of excellence",
      "start_date_time": "2026-06-15T19:00:00Z",
      "end_date_time": "2026-06-15T23:00:00Z",
      "address": "Grand Ballroom, New York",
      "event_for": "all",
      "capacity": 500,
      "entry_fee": 150,
      "category": "FEATURED",
      "image_url": "https://...",
      "total_registrations": 245,
      "is_deleted": false,
      "created_at": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `400`: Invalid page or pageSize

---

### 2.2 Get Event Details
**GET** `/events/:eventId`

Get detailed information about a specific event.

**Parameters:**
- `eventId` (number, path): Event ID

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "event_id": 1,
    "event_name": "Annual Gala 2026",
    "description": "Join us for an evening of excellence",
    "start_date_time": "2026-06-15T19:00:00Z",
    "end_date_time": "2026-06-15T23:00:00Z",
    "address": "Grand Ballroom, New York",
    "event_for": "all",
    "capacity": 500,
    "entry_fee": 150,
    "category": "FEATURED",
    "additional_info": "Formal attire required",
    "organizer_name": "TSSIA",
    "organizer_email": "events@tssia.org",
    "organizer_phone": "+1-800-123-4567",
    "organizer_role": "Event Manager",
    "registration_fields": [],
    "success_page_config": {},
    "image_url": "https://...",
    "is_deleted": false,
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Event ID is required
- `404`: Event not found

---

### 2.3 Create Event
**POST** `/events`

Create a new event (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "event_name": "Tech Summit 2026",
  "description": "Latest technology trends",
  "start_date_time": "2026-07-10T09:00:00Z",
  "end_date_time": "2026-07-10T17:00:00Z",
  "address": "Convention Center, San Francisco",
  "event_for": "all",
  "image_id": null,
  "capacity": 1000,
  "entry_fee": 75,
  "category": "CONFERENCE",
  "additional_info": "Lunch provided",
  "organizer_details": {
    "name": "Tech Events Inc",
    "email": "info@techevents.com",
    "phone": "+1-415-555-0123",
    "role": "Organizer"
  },
  "registration_fields": [],
  "success_page_config": {}
}
```

**Parameters:**
- `event_name` (string, required): Event name
- `description` (string, required): Event description
- `start_date_time` (ISO 8601, required): Start timestamp
- `end_date_time` (ISO 8601, required): End timestamp (must be after start)
- `address` (string, required): Event location
- `event_for` (string, required): "all" or "tssia_members"
- `capacity` (number, optional): Max attendees
- `entry_fee` (number, optional): Ticket price (default: 0)
- `category` (string, optional): Event type (default: "EVENT")
- `additional_info` (string, optional): Extra details
- `organizer_details` (object, optional): Organizer info
- `registration_fields` (array, optional): Custom form fields
- `success_page_config` (object, optional): Post-registration page config

**Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event_id": 42,
    "event_name": "Tech Summit 2026",
    /* ... full event data ... */
  }
}
```

**Error Responses:**
- `400`: Validation errors (missing fields, invalid dates, etc.)
- `401`: Not authenticated
- `403`: Not admin user

---

### 2.4 Update Event
**PUT** `/events/:eventId`

Update event details (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `eventId` (number, path): Event ID to update

**Request Body:** (same as Create Event)

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "event_id": 42,
    /* ... updated event data ... */
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Not authenticated
- `403`: Not admin
- `404`: Event not found

---

### 2.5 Delete Event
**DELETE** `/events/:eventId`

Soft delete an event (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `eventId` (number, path): Event ID to delete

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "event_id": 42,
    "is_deleted": true,
    /* ... event data ... */
  }
}
```

**Error Responses:**
- `400`: Event ID required
- `401`: Not authenticated
- `403`: Not admin
- `404`: Event not found

---

## 3. Registrations Routes (`/registrations`)

### 3.1 Register Participant
**POST** `/registrations`

Register a participant for an event (public endpoint).

**Request Body:**
```json
{
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "participant_phone": "+1-555-0123",
  "event_id": 1,
  "organization": "Tech Corp",
  "designation": "Manager",
  "tssia_membership_id": "TSSIA123456",
  "company_name": "Tech Corp",
  "membership_number": "TSSIA123456"
}
```

**Parameters:**
- `participant_name` (string, required): Full name
- `participant_email` (string, required): Email address
- `participant_phone` (string, required): Phone number
- `event_id` (number, required): Event to register for
- `organization` (string, optional): Organization name
- `designation` (string, optional): Job title
- `tssia_membership_id` (string, optional): Membership ID

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "registration_id": 123,
    "pass_number": "PASS-20260508-ABC123",
    "qr_code": "eyJyZWdpc3RyYXRpb25faWQiOjEyMywicGFzc19udW1iZXIiOiJQQVNTLTIwMjYwNTA4LUFCQzEyMyJ9"
  }
}
```

**Error Responses:**
- `400`: Validation errors or duplicate registration
- `404`: Event not found

---

### 3.2 Get All Registrations
**GET** `/registrations`

Get paginated list of all registrations (requires auth).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "registration_id": 123,
      "participant_id": 45,
      "participant_name": "Jane Smith",
      "event_id": 1,
      "event_name": "Annual Gala 2026",
      "organization": "Tech Corp",
      "designation": "Manager",
      "registration_status_id": 5,
      "attendance_status_id": 9,
      "is_deleted": false,
      "created_at": "2026-05-08T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "pageSize": 10,
    "totalPages": 25
  }
}
```

**Error Responses:**
- `401`: Not authenticated

---

### 3.3 Get Event Registrations
**GET** `/registrations/event/:eventId`

Get all registrations for a specific event (requires auth).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `eventId` (number, path): Event ID

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 10)

**Response (200):** (same format as 3.2)

**Error Responses:**
- `400`: Event ID required
- `401`: Not authenticated

---

### 3.4 Update Registration Status
**PATCH** `/registrations/:registrationId/status`

Update registration status (requires auth).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `registrationId` (number, path): Registration ID

**Request Body:**
```json
{
  "status": "approved"
}
```

**Possible Status Values:**
- `pending`
- `approved`
- `rejected`
- `waitlisted`

**Response (200):**
```json
{
  "success": true,
  "message": "Registration status updated successfully",
  "data": {
    "registration_id": 123,
    /* ... updated registration data ... */
  }
}
```

**Error Responses:**
- `400`: Invalid status
- `401`: Not authenticated
- `404`: Registration not found

---

## 4. Participants Routes (`/participants`)

### 4.1 Get Participant
**GET** `/participants/:participantId`

Get participant details.

**Parameters:**
- `participantId` (number, path): Participant ID

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "participant_id": 45,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "is_deleted": false,
    "created_by": 1,
    "created_at": "2026-05-08T15:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Participant ID required
- `404`: Participant not found

---

### 4.2 Create Participant
**POST** `/participants`

Create a new participant.

**Request Body:**
```json
{
  "name": "John Participant",
  "email": "john@example.com",
  "phone": "+1-555-0456"
}
```

**Parameters:**
- `name` (string, required): Full name
- `email` (string, required): Valid email
- `phone` (string, required): Phone number

**Response (201):**
```json
{
  "success": true,
  "message": "Participant created successfully",
  "data": {
    "participant_id": 46,
    "name": "John Participant",
    "email": "john@example.com",
    "phone": "+1-555-0456",
    "is_deleted": false,
    "created_at": "2026-05-08T16:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields

---

## 5. Passes Routes (`/passes`)

### 5.1 Get Pass Details
**GET** `/passes/:registration_id`

Get pass and QR code for a registration.

**Parameters:**
- `registration_id` (number, path): Registration ID

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "participant_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "event_name": "Annual Gala 2026",
    "start_date_time": "2026-06-15T19:00:00Z",
    "address": "Grand Ballroom, New York",
    "pass_number": "PASS-20260508-ABC123",
    "qr_code": "eyJyZWdpc3RyYXRpb25faWQiOjEyMywicGFzc19udW1iZXIiOiJQQVNTLTIwMjYwNTA4LUFCQzEyMyJ9"
  }
}
```

**Error Responses:**
- `400`: Registration ID required
- `404`: Pass not found

---

## 6. Scans Routes (`/scans`)

### 6.1 Scan QR Code
**POST** `/scans`

Mark attendance by scanning QR code (verifier only, requires auth).

**Headers:**
```
Authorization: Bearer <verifier_jwt_token>
```

**Request Body:**
```json
{
  "qr_code": "eyJyZWdpc3RyYXRpb25faWQiOjEyMywicGFzc19udW1iZXIiOiJQQVNTLTIwMjYwNTA4LUFCQzEyMyJ9"
}
```

**Parameters:**
- `qr_code` (string, required): Encoded QR code data or pass number

**Response (200):**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "registration_id": 123,
    "participant_name": "Jane Smith",
    "email": "jane@example.com",
    "event_name": "Annual Gala 2026",
    "organization": "Tech Corp",
    "designation": "Manager",
    "pass_number": "PASS-20260508-ABC123",
    "scan_timestamp": "2026-06-15T19:15:30Z",
    "status": "valid",
    "message": "Check-in Successful"
  }
}
```

**Special Responses:**

**Duplicate Scan (200):**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    /* ... registration data ... */
    "status": "duplicate",
    "message": "Already Scanned!"
  }
}
```

**Error Responses:**
- `400`: QR code required, invalid QR code, registration not approved
- `401`: Not authenticated

---

## 7. Custom Fields Routes (`/custom-fields`)

### 7.1 Get Event Custom Fields
**GET** `/custom-fields/event/:eventId`

Get custom fields for an event.

**Parameters:**
- `eventId` (number, path): Event ID

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "custom_id": 1,
      "event_id": 1,
      "field_name": "Company Size",
      "field_type": "dropdown",
      "required": true,
      "created_at": "2026-05-08T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Event ID required

---

### 7.2 Create Custom Field
**POST** `/custom-fields/event/:eventId`

Create custom field for event (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `eventId` (number, path): Event ID

**Request Body:**
```json
{
  "field_name": "Dietary Preferences",
  "field_type": "text",
  "required": false
}
```

**Field Types:**
- text, textarea, number, email, phone, dropdown, radio, checkbox, date, time, file, url

**Response (201):**
```json
{
  "success": true,
  "message": "Custom field created successfully",
  "data": {
    "custom_id": 2,
    "event_id": 1,
    "field_name": "Dietary Preferences",
    "field_type": "text",
    "required": false,
    "created_at": "2026-05-08T11:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid field type or missing required fields
- `401`: Not authenticated
- `403`: Not admin

---

### 7.3 Get Registration Custom Fields
**GET** `/custom-fields/registration/:registrationId`

Get custom field responses for a registration.

**Parameters:**
- `registrationId` (number, path): Registration ID

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "response_id": 1,
      "custom_id": 1,
      "field_name": "Company Size",
      "value": "50-100",
      "created_at": "2026-05-08T15:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Registration ID required

---

### 7.4 Save Custom Field Responses
**POST** `/custom-fields/registration/:registrationId`

Save custom field responses for a registration.

**Parameters:**
- `registrationId` (number, path): Registration ID

**Request Body:**
```json
{
  "customFields": [
    {
      "custom_id": 1,
      "value": "50-100"
    },
    {
      "custom_id": 2,
      "value": "Vegetarian"
    }
  ]
}
```

**Parameters:**
- `customFields` (array, required): Array of {custom_id, value}

**Response (201):**
```json
{
  "success": true,
  "message": "Custom field responses saved successfully",
  "data": [
    {
      "response_id": 10,
      "registration_id": 123,
      "custom_id": 1,
      "value": "50-100",
      "created_at": "2026-05-08T15:35:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid data format

---

## 8. Dashboard Routes (`/dashboard`)

### 8.1 Get Dashboard Statistics
**GET** `/dashboard`

Get admin dashboard statistics (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "summary": {
      "total_users": 156,
      "total_events": 12,
      "total_registrations": 2345,
      "total_scans": 1890
    },
    "registrations_by_status": [
      {
        "name": "approved",
        "count": 1800
      },
      {
        "name": "pending",
        "count": 445
      },
      {
        "name": "rejected",
        "count": 100
      }
    ],
    "attendance_by_status": [
      {
        "name": "attended",
        "count": 1890
      },
      {
        "name": "no_show",
        "count": 455
      }
    ],
    "top_events": [
      {
        "event_id": 1,
        "event_name": "Annual Gala 2026",
        "registration_count": 450
      },
      {
        "event_id": 3,
        "event_name": "Tech Summit 2026",
        "registration_count": 380
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

## 9. Health Check Route (`/health`)

### 9.1 Health Check
**GET** `/health`

Check if backend is running (public endpoint).

**Response (200):**
```json
{
  "status": "✅ Backend is running",
  "timestamp": "2026-05-08T17:00:00Z"
}
```

---

## Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid parameters or validation errors |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email already exists) |
| 500 | Internal Server Error | Server error |

---

## Testing with Postman

Import the Postman collection from `/postman/collections/EMS API/` folder.

### Collection Includes:
- Auth (Login, Register, Profile)
- Events (CRUD operations)
- Registrations (Create, List, Update Status)
- Participants (Create, Get)
- Passes (Get QR code)
- Scans (Mark attendance)
- Dashboard (Statistics)
- Custom Fields (Create, Get, Save responses)

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting in production:
- 100 requests per minute per IP
- 10 requests per minute for sensitive endpoints (auth, scans)

---

## CORS Configuration

Frontend can be accessed from: `http://localhost:5173`

To add more origins, update `CORS_ORIGIN` in `.env`:
```env
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-08 | Initial release with all core endpoints |

---

**Last Updated**: May 8, 2026
