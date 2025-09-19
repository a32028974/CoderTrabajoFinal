import Ticket from "../models/Ticket.js";

class TicketDAO {
  create(data) { return Ticket.create(data); }
}
export default new TicketDAO();
