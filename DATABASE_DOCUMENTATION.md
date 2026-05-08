# Event Management System - Database Documentation

## 📊 Database Overview

**Database Name**: `ems_db`  
**Database Type**: PostgreSQL 12+  
**Connection**: TCP/IP on localhost:5432  
**Encoding**: UTF-8

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────┐
│          ROLES           │
├──────────────────────────┤
│ role_id (PK)             │
│ name                     │
│ description              │
│ created_at               │
└──────────────┬───────────┘
               │ 1:N
               │
┌──────────────▼────────────────────────┐
│          USERS                         │
├────────────────────────────────────────┤
│ user_id (PK)                           │
│ name                                   │
│ email (UNIQUE)                         │
│ username (UNIQUE)                      │
│ password (HASHED)                      │
│ role_id (FK) → roles.role_id           │
│ is_deleted                             │
│ created_at                             │
│ updated_at                             │
└──────────────┬──────────────────────────┘
               │ 1:N (creates)
               │
       ┌───────┴─────────┐
       │                 │
       │ 1:N (creates)   │
       │                 │
┌──────▼──────────────────┐    ┌────────────────────────────────┐
│   PARTICIPANTS          │    │      EVENTS                     │
├─────────────────────────┤    ├─────────────────────────────────┤
│ participant_id (PK)     │    │ event_id (PK)                  │
│ name                    │◄───│ event_name                     │
│ email                   │    │ description                    │
│ phone                   │    │ start_date_time                │
│ is_deleted              │    │ end_date_time                  │
│ created_by (FK) → users │    │ address                        │
│ created_at              │    │ event_for (all/tssia_members)  │
└──────────┬──────────────┘    │ capacity                       │
           │ 1:N                │ entry_fee                      │
           │                    │ category                       │
           │ participates       │ organizer_name                 │
           │                    │ organizer_email                │
           │                    │ organizer_phone                │
           │                    │ image_id                       │
           │                    │ registration_fields (JSONB)    │
           │                    │ success_page_config (JSONB)    │
           │                    │ is_deleted                     │
           │                    │ created_at                     │
           │                    │ updated_at                     │
           │                    └────────────┬────────────────────┘
           │                                 │ 1:N
           │                                 │
           │                    ┌────────────▼────────────┐
           │                    │   EVENT_REGISTRATIONS    │
           │                    ├──────────────────────────┤
           │                    │ registration_id (PK)     │
           │              ┌─────│ participant_id (FK) ─────┤
           │              │     │ event_id (FK) ────┐     │
           │              │     │ organization       │     │
           │              │     │ designation        │     │
           │              │     │ tssia_membership_id
           │              │     │ registration_status_id (FK)
           │              │     │ attendance_status_id (FK)
           │              │     │ responses (JSONB)  │     │
           │              │     │ is_deleted         │     │
           │              │     │ created_by (FK) ───┤─────┤──> users
           │              │     │ created_at         │     │
           │              │     │ updated_at         │     │
           │              │     └────────────┬───────┘     │
           │              │                  │              │
           │              │                  │ 1:1          │
           │              │                  │              │
           │              │    ┌─────────────▼──────────┐   │
           │              └───►│     PASSES              │   │
           │                   ├───────────────────────┤    │
           │                   │ pass_id (PK)          │    │
           │                   │ registration_id (FK)  │    │
           │                   │ pass_number (UNIQUE)  │    │
           │                   │ created_by (FK)       │────┴──> users
           │                   │ created_at            │
           │                   │ updated_at            │
           │                   └────────────┬──────────┘
           │                                │ 1:1
           │                                │
           │                   ┌────────────▼──────────┐
           │                   │    QR_CODES            │
           │                   ├───────────────────────┤
           │                   │ qr_code_id (PK)       │
           │                   │ pass_id (FK)          │
           │                   │ qr_code (UNIQUE)      │
           │                   │ created_at            │
           │                   └───────────────────────┘
           │
           │ 1:N
           │
    ┌──────▴──────────────────┐
    │  CUSTOM_FIELD_RESPONSES  │
    ├─────────────────────────┤
    │ response_id (PK)        │
    │ registration_id (FK)    │
    │ custom_id (FK)          │
    │ value                   │
    │ created_at              │
    └─────────────────────────┘
            │
            │ N:1
            │
    ┌───────▴──────────────────────┐
    │    CUSTOM_FIELDS              │
    ├───────────────────────────────┤
    │ custom_id (PK)                │
    │ event_id (FK) ─────┐          │
    │ field_name         │          │
    │ field_type         │          │
    │ required           │          │
    │ created_at         │          │
    └──────────┬─────────┘          │
               │ N:1                │
               └──────────┬─────────┘
                          ▲
                          │
                ┌─────────┴─────────┐
                │                   │
    ┌───────────▼──────────┐   ┌────▼──────────────────────┐
    │  SCAN_LOGS           │   │ STATUS_MASTER (Lookup)     │
    ├──────────────────────┤   ├────────────────────────────┤
    │ scan_id (PK)         │   │ status_id (PK)             │
    │ event_id (FK)        │   │ type (attendance/registration)
    │ registration_id (FK) │   │ name                       │
    │ scanned_by (FK)      │   │ description                │
    │ scan_timestamp       │   │ created_at                 │
    │ updated_at           │   └────────────────────────────┘
    └──────────────────────┘
```

---

## Table Schemas

### 1. ROLES Table

**Purpose**: Store user roles and their permissions

```sql
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_roles_name ON roles(name);

-- Sample Data
INSERT INTO roles (name, description) VALUES
('user', 'Regular user - can register for events'),
('admin', 'Administrator - can manage events and users'),
('verifier', 'Verifier - can scan QR codes and mark attendance');
```

---

### 2. USERS Table

**Purpose**: Store user account information with authentication

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(role_id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Trigger for updated_at
CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

**Data Integrity**:
- Email must be unique
- Password is hashed with bcryptjs (never store plaintext)
- Soft delete using is_deleted flag
- Timestamps for audit trail

---

### 3. EVENTS Table

**Purpose**: Store event information

```sql
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date_time TIMESTAMP NOT NULL,
  end_date_time TIMESTAMP NOT NULL,
  address VARCHAR(255) NOT NULL,
  event_for VARCHAR(50) NOT NULL,  -- 'all' or 'tssia_members'
  capacity INTEGER,
  entry_fee DECIMAL(10, 2) DEFAULT 0.00,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_start_date ON events(start_date_time);
CREATE INDEX idx_events_is_deleted ON events(is_deleted);
CREATE INDEX idx_events_event_for ON events(event_for);
```

**Data Integrity**:
- start_date_time must be before end_date_time
- capacity must be positive if provided
- entry_fee must be >= 0
- Soft delete using is_deleted flag

---

### 4. PARTICIPANTS Table

**Purpose**: Store participant information

```sql
CREATE TABLE participants (
  participant_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_is_deleted ON participants(is_deleted);
CREATE INDEX idx_participants_created_by ON participants(created_by);

-- Unique constraint on email per event (via registrations)
```

**Data Integrity**:
- Email is required
- Soft delete using is_deleted flag
- Track who created the participant record

---

### 5. EVENT_REGISTRATIONS Table

**Purpose**: Store event registration records

```sql
CREATE TABLE event_registrations (
  registration_id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(participant_id),
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  organization VARCHAR(255),
  designation VARCHAR(100),
  tssia_membership_id VARCHAR(100),
  registration_status_id INTEGER NOT NULL REFERENCES status_master(status_id),
  attendance_status_id INTEGER NOT NULL REFERENCES status_master(status_id),
  responses JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_event_registrations_participant_id ON event_registrations(participant_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(registration_status_id);
CREATE INDEX idx_event_registrations_attendance ON event_registrations(attendance_status_id);
CREATE INDEX idx_event_registrations_is_deleted ON event_registrations(is_deleted);

-- Composite index for finding registrations per event
CREATE INDEX idx_event_registrations_event_status ON event_registrations(event_id, registration_status_id);

-- Unique constraint: one registration per participant per event
CREATE UNIQUE INDEX idx_participant_event_unique ON event_registrations(participant_id, event_id)
WHERE is_deleted = FALSE;
```

**Data Integrity**:
- Prevent duplicate registrations (same participant, same event)
- Status must reference valid status_master entries
- Soft delete using is_deleted flag

---

### 6. PASSES Table

**Purpose**: Store event passes with unique identifiers

```sql
CREATE TABLE passes (
  pass_id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL UNIQUE REFERENCES event_registrations(registration_id),
  pass_number VARCHAR(50) NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_passes_registration_id ON passes(registration_id);
CREATE INDEX idx_passes_pass_number ON passes(pass_number);
CREATE INDEX idx_passes_created_by ON passes(created_by);
```

**Data Integrity**:
- One pass per registration (1:1 relationship)
- Pass number must be unique (for scanning)
- Pass number format: PASS-YYYYMMDD-XXXXXX

---

### 7. QR_CODES Table

**Purpose**: Store QR code data for scanning

```sql
CREATE TABLE qr_codes (
  qr_code_id SERIAL PRIMARY KEY,
  pass_id INTEGER NOT NULL UNIQUE REFERENCES passes(pass_id),
  qr_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_qr_codes_pass_id ON qr_codes(pass_id);
CREATE INDEX idx_qr_codes_qr_code ON qr_codes(qr_code);
```

**Data Format**:
- QR code contains Base64-encoded JSON:
```json
{
  "registration_id": 123,
  "pass_number": "PASS-20260508-ABC123"
}
```

---

### 8. SCAN_LOGS Table

**Purpose**: Track all attendance scans for audit trail

```sql
CREATE TABLE scan_logs (
  scan_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  registration_id INTEGER NOT NULL REFERENCES event_registrations(registration_id),
  scanned_by INTEGER REFERENCES users(user_id),
  scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scan_logs_event_id ON scan_logs(event_id);
CREATE INDEX idx_scan_logs_registration_id ON scan_logs(registration_id);
CREATE INDEX idx_scan_logs_scanned_by ON scan_logs(scanned_by);
CREATE INDEX idx_scan_logs_scan_timestamp ON scan_logs(scan_timestamp);

-- Composite index for analytics
CREATE INDEX idx_scan_logs_event_timestamp ON scan_logs(event_id, scan_timestamp);
```

**Data Integrity**:
- Track who scanned (scanned_by user_id)
- Track when scan occurred
- Never delete scan logs (audit trail)

---

### 9. CUSTOM_FIELDS Table

**Purpose**: Store dynamic form fields for events

```sql
CREATE TABLE custom_fields (
  custom_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(event_id),
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  -- Valid types: text, textarea, number, email, phone, dropdown, radio, checkbox, date, time, file, url
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_custom_fields_event_id ON custom_fields(event_id);
```

**Supported Field Types**:
- `text` - Single line text input
- `textarea` - Multi-line text area
- `number` - Numeric input
- `email` - Email format validation
- `phone` - Phone number format
- `dropdown` - Select from predefined options
- `radio` - Single selection from options
- `checkbox` - Multiple checkbox selections
- `date` - Date picker
- `time` - Time picker
- `file` - File upload
- `url` - URL format validation

---

### 10. CUSTOM_FIELD_RESPONSES Table

**Purpose**: Store participant responses to custom fields

```sql
CREATE TABLE custom_field_responses (
  response_id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES event_registrations(registration_id),
  custom_id INTEGER NOT NULL REFERENCES custom_fields(custom_id),
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_custom_field_responses_registration_id ON custom_field_responses(registration_id);
CREATE INDEX idx_custom_field_responses_custom_id ON custom_field_responses(custom_id);

-- Composite index for finding all responses for a registration
CREATE INDEX idx_custom_field_responses_reg_custom ON custom_field_responses(registration_id, custom_id);
```

---

### 11. STATUS_MASTER Table

**Purpose**: Lookup table for various statuses

```sql
CREATE TABLE status_master (
  status_id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,  -- 'attendance' or 'registration'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_status_master_type_name ON status_master(type, name);

-- Sample Data
INSERT INTO status_master (type, name, description) VALUES
-- Registration statuses
('registration', 'pending', 'Pending admin approval'),
('registration', 'approved', 'Approved for attendance'),
('registration', 'rejected', 'Registration rejected'),
('registration', 'waitlisted', 'Added to waitlist'),

-- Attendance statuses
('attendance', 'no_show', 'Did not attend'),
('attendance', 'pending', 'Not yet scanned'),
('attendance', 'attended', 'Present at event'),
('attendance', 'present', 'Currently present');
```

---

## Key Relationships

### 1:1 Relationships
- `passes` ↔ `event_registrations` (one pass per registration)
- `qr_codes` ↔ `passes` (one QR code per pass)

### 1:N Relationships
- `roles` → `users` (one role, many users)
- `events` → `event_registrations` (one event, many registrations)
- `participants` → `event_registrations` (one participant, many registrations)
- `users` → `event_registrations` (one user creates many registrations)
- `custom_fields` → `custom_field_responses` (one field, many responses)
- `event_registrations` → `scan_logs` (one registration, many scans)

---

## Indexes & Performance

### Frequently Queried Columns (Indexed)
```sql
-- User lookups
users.email
users.username
users.is_deleted

-- Event lookups
events.event_id
events.event_name
events.start_date_time
events.is_deleted

-- Registration lookups
event_registrations.event_id
event_registrations.participant_id
event_registrations.is_deleted

-- Scan lookups
scan_logs.qr_code OR passes.pass_number
scan_logs.event_id
```

### Composite Indexes (for analytics)
```sql
-- Find all attended registrations for an event
event_registrations(event_id, attendance_status_id)

-- Find all scans for an event in time range
scan_logs(event_id, scan_timestamp)
```

---

## Soft Delete Strategy

All main tables support soft deletes using `is_deleted` flag:
- `users.is_deleted`
- `events.is_deleted`
- `participants.is_deleted`
- `event_registrations.is_deleted`

**Benefits**:
- Preserve audit trail
- Recover accidentally deleted records
- Maintain referential integrity

**Query Pattern**:
```sql
-- Always filter out deleted records
SELECT * FROM events WHERE is_deleted = FALSE;
SELECT * FROM users WHERE is_deleted = FALSE;
```

---

## Data Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| users.email | Valid email format | "Invalid email format" |
| users.password | Min 6 characters | "Password must be at least 6 characters" |
| events.event_name | Not empty | "Event name is required" |
| events.start_date_time | Valid ISO 8601 | "Invalid start date/time" |
| events.end_date_time | After start_date_time | "End date must be after start date" |
| events.address | Not empty | "Address is required" |
| events.event_for | "all" or "tssia_members" | "Invalid event_for value" |
| participants.email | Not empty | "Email is required" |
| participants.phone | Valid phone format | "Invalid phone format" |
| custom_fields.field_type | Valid type | "Invalid field type" |

---

## Database Maintenance

### Regular Tasks

**Daily**:
- Monitor disk space usage
- Check error logs

**Weekly**:
- Verify backup completion
- Check query performance

**Monthly**:
- Analyze table statistics: `ANALYZE;`
- Reindex if needed: `REINDEX;`
- Archive old scan logs if needed

**Quarterly**:
- Backup verification
- Performance tuning review
- Security audit

### Backup & Recovery

**Full Backup**:
```bash
pg_dump -U postgres ems_db > backup_$(date +%Y%m%d).sql
```

**Compressed Backup**:
```bash
pg_dump -U postgres ems_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Restore from Backup**:
```bash
psql -U postgres ems_db < backup_20260508.sql
```

### Connection Pooling

Default pool settings:
- Min connections: 1
- Max connections: 10
- Idle timeout: 30s
- Connection timeout: 2s

Adjust in `src/config/db.js` based on load:
```javascript
const poolConfig = {
  max: 20,  // Increase for high traffic
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

---

## Analytics Queries

### Event Statistics
```sql
SELECT 
  e.event_id, e.event_name,
  COUNT(er.registration_id) as total_registrations,
  COUNT(CASE WHEN er.attendance_status_id = 8 THEN 1 END) as attended,
  COUNT(CASE WHEN er.attendance_status_id = 7 THEN 1 END) as no_show
FROM events e
LEFT JOIN event_registrations er ON e.event_id = er.event_id
WHERE e.is_deleted = FALSE
GROUP BY e.event_id, e.event_name
ORDER BY total_registrations DESC;
```

### Attendance by Hour
```sql
SELECT 
  DATE_TRUNC('hour', scan_timestamp) as hour,
  COUNT(*) as scans
FROM scan_logs
WHERE event_id = $1
GROUP BY DATE_TRUNC('hour', scan_timestamp)
ORDER BY hour;
```

### Registration Status Breakdown
```sql
SELECT 
  sm.name as status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM event_registrations er
JOIN status_master sm ON er.registration_status_id = sm.status_id
WHERE er.event_id = $1 AND er.is_deleted = FALSE
GROUP BY sm.name;
```

---

**Last Updated**: May 8, 2026
