// src/routes/product.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import productRepo from "../repositories/product.repository.js";

const router = Router();

// Listar productos (público)
router.get("/", async (_req, res) => {
  const products = await productRepo.findAll();
  res.json(products);
});

// Crear (admin)
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const product = await productRepo.create(req.body);
    res.status(201).json({ message: "Producto creado", product });
  } catch (err) {
    res.status(500).json({ message: "Error al crear", error: err.message });
  }
});

// Actualizar (admin)
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const product = await productRepo.updateById(req.params.id, req.body);
    res.json({ message: "Producto actualizado", product });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar", error: err.message });
  }
});

// Eliminar (admin)
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    await productRepo.deleteById(req.params.id);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar", error: err.message });
  }
});

export default router;
