// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload: { id, role, email } (lo seteamos en login)
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
