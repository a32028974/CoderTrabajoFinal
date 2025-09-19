// src/repositories/cart.repository.js
import * as cartDao from "../daos/cart.dao.js";

class CartRepository {
  async getByUser(userId) {
    return cartDao.getByUserId(userId);
  }

  async getOrCreateByUser(userId) {
    let cart = await cartDao.getByUserId(userId);
    if (!cart) {
      cart = await cartDao.create({ user: userId, items: [] });
    }
    return cart;
  }

  async update(cartId, data) {
    return cartDao.update(cartId, data);
  }
}

export default new CartRepository();
