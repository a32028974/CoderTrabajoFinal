// src/repositories/product.repository.js
import * as productDao from "../daos/product.dao.js";

class ProductRepository {
  async create(data) {
    return productDao.create(data);
  }
  async findAll() {
    return productDao.findAll();
  }
  async findById(id) {
    return productDao.findById(id);
  }
  async updateById(id, data) {
    return productDao.updateById(id, data);
  }
  async deleteById(id) {
    return productDao.deleteById(id);
  }

  // Utilidad para compras (simple, sin concurrencia avanzada)
  async decreaseStock(productId, quantity) {
    const product = await productDao.findById(productId);
    if (!product) return null;
    const newStock = product.stock - quantity;
    if (newStock < 0) return null;
    return productDao.updateById(productId, { stock: newStock });
  }
}

export default new ProductRepository();
