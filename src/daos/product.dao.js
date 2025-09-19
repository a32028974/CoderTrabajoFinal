import Product from "../models/Product.js";

class ProductDAO {
  create(data) { return Product.create(data); }
  findAll() { return Product.find(); }
  findById(id) { return Product.findById(id); }
  updateById(id, data) { return Product.findByIdAndUpdate(id, data, { new: true }); }
  deleteById(id) { return Product.findByIdAndDelete(id); }
}
export default new ProductDAO();
