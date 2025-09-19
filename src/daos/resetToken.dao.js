import ResetToken from "../models/ResetToken.js";

class ResetTokenDAO {
  create(data) { return ResetToken.create(data); }
  findByUserAndHash(userId, tokenHash) { return ResetToken.findOne({ userId, tokenHash }); }
  deleteByUser(userId) { return ResetToken.deleteMany({ userId }); }
}
export default new ResetTokenDAO();
