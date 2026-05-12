# Ticket Auto-Generation - Quick Start Guide

## 🚀 Implementation Complete!

Your ticket auto-generation system is now fully implemented and ready to use.

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Create Tickets Table
Run the migration script to add the tickets table to your database:

```bash
cd EMS-Backend
node scripts/create_tickets_table.js
```

**Expected Output**:
```
✅ tickets table created successfully
```

### Step 2: Restart Backend Server
```bash
npm start
# or
npm run dev
```

### Step 3: Restart Frontend
```bash
cd EMS-Frontend
npm run dev
```

---

## 📋 How It Works

### Admin Workflow:

1. **Save Ticket Template**
   - Go to Admin → Ticket Designer
   - Select event
   - Design/customize ticket
   - Click **Save** (or let auto-save do it every 1.5s)

2. **Approve Participant**
   - Go to Admin → Registrations
   - Find pending registration
   - Click **Approve**
   - ✅ Ticket auto-generates instantly!

3. **Manage Tickets**
   - Go to Admin → Ticket Management
   - Select event
   - See all auto-generated tickets
   - Click actions:
     - 👁️ **Preview** - View ticket & QR code
     - ⬇️ **Download** - Mark as downloaded
     - 🖨️ **Print** - Mark as printed
     - 🗑️ **Delete** - Remove ticket

---

## 🎯 What Gets Auto-Generated

When participant is approved, the system automatically:

✅ **Creates Unique Pass**
- Generates unique pass number
- Stores in database

✅ **Generates QR Code**
- Encodes pass information
- Ready for scanning

✅ **Generates Ticket**
- Links to participant profile
- Links to event details
- Links to pass & QR
- Stores all data in database
- Template reference saved

---

## 📊 Ticket Data Includes

```
Participant:
  - Name
  - Email
  - Phone
  - Organization
  - Designation

Event:
  - Event name
  - Date & time
  - Location

Pass:
  - Pass number
  - QR code

Status:
  - Downloaded flag
  - Printed flag
```

---

## 🔗 New API Endpoints

### Ticket Management
```
GET    /api/tickets                    - All tickets
GET    /api/tickets/:ticketId          - Single ticket
GET    /api/tickets/event/:eventId     - Event tickets
GET    /api/tickets/registration/:regId - Registration ticket
PATCH  /api/tickets/:ticketId/downloaded - Mark downloaded
PATCH  /api/tickets/:ticketId/printed  - Mark printed
DELETE /api/tickets/:ticketId          - Delete ticket
```

### Template Management
```
GET    /api/tickets/templates          - All templates
GET    /api/tickets/templates/:eventId - Event template
POST   /api/tickets/templates          - Save template
```

---

## 📁 New Files Created

```
Backend:
├── scripts/create_tickets_table.js       ← Run this migration
├── TICKET_AUTO_GENERATION_GUIDE.md       ← Full documentation
└── [Modified] src/controllers/registration.controller.js
                src/controllers/ticket.controller.js
                src/routes/ticket.routes.js

Frontend:
├── src/component/Admin/TicketManagement.jsx  ← New UI component
└── [Modified] src/api/api.js
```

---

## ✨ Key Features

✅ **Completely Automatic**
- No manual intervention needed
- Triggers on approval

✅ **Database Integrated**
- All data fetched from database
- Real-time information

✅ **Status Tracking**
- Download tracking
- Print tracking
- Soft deletes for history

✅ **Admin Dashboard**
- List all tickets
- Filter by event
- Preview tickets
- Manage status
- Pagination support

✅ **Error Handling**
- Transaction-based consistency
- Duplicate prevention
- Soft deletes

---

## 🧪 Testing Checklist

- [ ] Run migration script successfully
- [ ] Participant registers for event
- [ ] Admin approves participant
- [ ] Ticket appears in Ticket Management
- [ ] Ticket data shows participant name, email, event
- [ ] QR code displays correctly
- [ ] Download/Print toggles work
- [ ] Delete removes ticket
- [ ] Pagination works with multiple tickets
- [ ] Filter by event works correctly

---

## 📞 Troubleshooting

### Tickets not generating?
- ✅ Check migration ran: `node scripts/create_tickets_table.js`
- ✅ Verify tickets table exists in database
- ✅ Check backend server logs for errors
- ✅ Ensure approval status is "approved" (case-sensitive)

### Ticket Management page empty?
- ✅ Select an event from dropdown
- ✅ Check if event has approved participants
- ✅ Verify API is responding: Open browser console
- ✅ Check network tab for API calls

### QR code not showing?
- ✅ Verify qr_codes table has records
- ✅ Check if encodeQRData() is working
- ✅ Backend logs should show pass generation

### Data showing as empty in ticket?
- ✅ Verify participant exists in database
- ✅ Verify event exists in database
- ✅ Check foreign keys are properly set
- ✅ Run: `SELECT * FROM tickets WHERE ticket_id = X;`

---

## 📈 Performance

- **Queries Indexed**: All frequently used fields
- **Pagination**: 10 tickets per page default
- **Soft Deletes**: Historical data preserved
- **Transactions**: Atomic operations

---

## 🔐 Security

- ✅ Database constraints enforce relationships
- ✅ Soft deletes preserve audit trail
- ✅ Timestamps track all changes
- ✅ created_by field tracks creator
- ✅ Authentication middleware on all admin routes

---

## 📚 Full Documentation

See: `EMS-Backend/TICKET_AUTO_GENERATION_GUIDE.md`

Contains:
- Complete workflow diagrams
- Database schema details
- API response examples
- Architecture benefits
- Implementation notes

---

## ✅ Ready to Go!

Your ticket auto-generation system is complete and ready for production.

**Next Steps:**
1. Run the migration script
2. Restart servers
3. Test with a participant approval
4. Start managing tickets in Ticket Management

Questions? Check the full guide or review the code in:
- `registration.controller.js` (auto-generation logic)
- `ticket.controller.js` (API endpoints)
- `TicketManagement.jsx` (frontend UI)
