// src/repositories/ticket.repository.js
import * as ticketDao from "../daos/ticket.dao.js";

class TicketRepository {
  async create(data) {
    return ticketDao.create(data);
  }
}

export default new TicketRepository();
