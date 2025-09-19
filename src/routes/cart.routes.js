// src/routes/cart.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import cartRepo from "../repositories/cart.repository.js";
import productRepo from "../repositories/product.repository.js";
import { purchase } from "../services/purchase.service.js";

const router = Router();

// Agregar producto al carrito (SOLO user)
router.post("/add", verifyToken, authorizeRoles("user"), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: "productId requerido" });

    const product = await productRepo.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const cart = await cartRepo.getOrCreateByUser(req.user.id);
    const existing = (cart.items || []).find(i => String(i.productId) === String(productId));

    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ productId, quantity: Number(quantity) });

    await cartRepo.update(cart._id, cart);
    res.json({ message: "Producto agregado al carrito", cart });
  } catch (err) {
    res.status(500).json({ message: "Error al agregar al carrito", error: err.message });
  }
});

// Checkout (SOLO user)
router.post("/checkout", verifyToken, authorizeRoles("user"), async (req, res) => {
  try {
    const result = await purchase(req.user.id);
    res.json(result); // { ticket, purchased, notPurchased }
  } catch (err) {
    res.status(500).json({ message: "Error en la compra", error: err.message });
  }
});

export default router;
