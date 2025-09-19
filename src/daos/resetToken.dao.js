// src/daos/resetToken.dao.js
import ResetToken from "../models/ResetToken.js";

class ResetTokenDAO {
  async create(data) {
    return ResetToken.create(data);
  }
 
  async findByHash(tokenHash) {
  return ResetToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() } // asegura que no esté vencido
  });
}

  async findByUserAndHash(userId, tokenHash) {
    return ResetToken.findOne({
      userId,
      tokenHash,
      expiresAt: { $gt: new Date() }   // ✅ valida que no esté vencido
    });
  }

  async deleteByUser(userId) {
    return ResetToken.deleteMany({ userId });
  }
}

export default new ResetTokenDAO();
