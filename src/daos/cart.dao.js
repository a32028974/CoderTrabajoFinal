import Cart from "../models/Cart.js";

class CartDAO {
  findByUser(userId) { return Cart.findOne({ userId }); }
  create(data) { return Cart.create(data); }
  update(id, data) { return Cart.findByIdAndUpdate(id, data, { new: true }); }
}
export default new CartDAO();
