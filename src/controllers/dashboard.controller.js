import { query } from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // Total users
    const usersResult = await query(
      'SELECT COUNT(*) as total FROM users WHERE is_deleted = false'
    );
    const totalUsers = parseInt(usersResult.rows[0].total, 10);

    // Total events
    const eventsResult = await query(
      'SELECT COUNT(*) as total FROM events WHERE is_deleted = false'
    );
    const totalEvents = parseInt(eventsResult.rows[0].total, 10);

    // Total registrations
    const registrationsResult = await query(
      'SELECT COUNT(*) as total FROM event_registrations WHERE is_deleted = false'
    );
    const totalRegistrations = parseInt(registrationsResult.rows[0].total, 10);

    // Total scans
    const scansResult = await query(
      `SELECT COUNT(*) as total FROM scan_logs sl 
       JOIN event_registrations er ON sl.registration_id = er.registration_id 
       WHERE er.is_deleted = false`
    );
    const totalScans = parseInt(scansResult.rows[0].total, 10);

    // Registrations by status
    const registrationsByStatusResult = await query(
      `SELECT sm.name, COUNT(*) as count 
       FROM event_registrations er 
       LEFT JOIN status_master sm ON er.registration_status_id = sm.status_id 
       WHERE er.is_deleted = false 
       GROUP BY sm.name`
    );
    const registrationsByStatus = registrationsByStatusResult.rows;

    // Attendance by status
    const attendanceByStatusResult = await query(
      `SELECT sm.name, COUNT(*) as count 
       FROM event_registrations er 
       LEFT JOIN status_master sm ON er.attendance_status_id = sm.status_id 
       WHERE er.is_deleted = false 
       GROUP BY sm.name`
    );
    const attendanceByStatus = attendanceByStatusResult.rows;

    // Top events by registrations
    const topEventsResult = await query(
      `SELECT e.event_id, e.event_name, COUNT(er.registration_id) as registration_count 
       FROM events e 
       LEFT JOIN event_registrations er ON e.event_id = er.event_id AND er.is_deleted = false 
       WHERE e.is_deleted = false 
       GROUP BY e.event_id, e.event_name 
       ORDER BY registration_count DESC 
       LIMIT 10`
    );
    const topEvents = topEventsResult.rows;

    return sendSuccess(res, {
      summary: {
        total_users: totalUsers,
        total_events: totalEvents,
        total_registrations: totalRegistrations,
        total_scans: totalScans,
      },
      registrations_by_status: registrationsByStatus,
      attendance_by_status: attendanceByStatus,
      top_events: topEvents,
    });
  } catch (error) {
    next(error);
  }
};
