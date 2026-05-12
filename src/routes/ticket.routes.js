import express from 'express';
import { 
  getTicketTemplate, 
  saveTicketTemplate, 
  getAllTicketTemplates,
  getTicket,
  getEventTickets,
  getRegistrationTicket,
  getAllTickets,
  markTicketDownloaded,
  markTicketPrinted,
  updateTicketData,
  deleteTicket
} from '../controllers/ticket.controller.js';

const router = express.Router();

// Template routes
router.get('/templates', getAllTicketTemplates);
router.get('/templates/:eventId', getTicketTemplate);
router.post('/templates', saveTicketTemplate);

// Ticket management routes
router.get('/', getAllTickets);
router.get('/:ticketId', getTicket);
router.get('/event/:eventId', getEventTickets);
router.get('/registration/:registrationId', getRegistrationTicket);
router.patch('/:ticketId/downloaded', markTicketDownloaded);
router.patch('/:ticketId/printed', markTicketPrinted);
router.patch('/:ticketId/data', updateTicketData);
router.delete('/:ticketId', deleteTicket);

export default router;