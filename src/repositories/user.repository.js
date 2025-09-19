// src/repositories/user.repository.js
import userDao from "../daos/user.dao.js";

class UserRepository {
  async create(data) {
    return userDao.create(data);
  }

  async getByEmail(email) {
    return userDao.findByEmail(email);
  }

  async getById(id) {
    return userDao.findById(id);
  }

  async updateById(id, data) {
    return userDao.updateById(id, data);
  }

  async updatePassword(id, hashedPassword) {
    return userDao.updateById(id, { password: hashedPassword });
  }
}

export default new UserRepository();
