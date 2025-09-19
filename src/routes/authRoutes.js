// src/routes/authRoutes.js
import { Router } from "express";
import { register, login, forgot, reset, current } from "../controllers/authController.js";
import { sendResetEmail } from "../services/mail.service.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// DTO sin datos sensibles (requiere JWT)
router.get("/current", verifyToken, current);

router.post("/forgot", forgot);
router.post("/reset", reset);

// 🔧 test manual: envía un mail simple a tu dirección
router.post("/test-mail", async (req, res) => {
  try {
    const to = req.body.to;
    if (!to) return res.status(400).json({ error: "Falta 'to'" });
    await sendResetEmail(to, "https://example.com/reset?demo=1");
    res.json({ ok: true });
  } catch (e) {
    console.error("❗ test-mail error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
