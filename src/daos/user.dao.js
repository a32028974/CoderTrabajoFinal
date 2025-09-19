// src/daos/user.dao.js
import { User } from "../models/User.js"; // tu modelo exporta { User }

const userDao = {
  create(data) {
    return User.create(data);
  },
  findByEmail(email) {
    return User.findOne({ email });
  },
  findById(id) {
    return User.findById(id);
  },
  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true });
  },
};

export default userDao;
