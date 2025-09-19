// src/routes/protected.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import UserDTO from "../dto/UserDTO.js";
import userRepo from "../repositories/user.repository.js";

const router = Router();

// /current -> DTO (sin password)
router.get("/current", verifyToken, async (req, res, next) => {
  try {
    const user = await userRepo.getById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const dto = new UserDTO(user);
    res.json({ user: dto });
  } catch (err) {
    next(err);
  }
});

// ejemplos de rol
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Panel admin", user: req.user });
});

router.get("/user", verifyToken, authorizeRoles("user"), (req, res) => {
  res.json({ message: "Solo usuarios", user: req.user });
});

export default router;
