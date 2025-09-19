// src/controllers/authController.js
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Model y servicio para recuperación de contraseña
import ResetToken from "../models/ResetToken.js";              // requiere src/models/ResetToken.js
import { sendResetEmail } from "../services/mail.service.js";  // requiere src/services/mail.service.js

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Utilidad para hashear el token que guardamos en DB (nunca guardamos el token plano)
const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: String(error) });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    if (!JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Config del servidor incompleta", error: "JWT_SECRET no definido" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: String(error) });
  }
};

/**
 * POST /api/auth/forgot
 * Body: { "email": "user@test.com" }
 * - Envía email con link que expira en 1 hora (uid y token)
 * - Responde genérico para no filtrar si el email existe o no
 */
export const forgot = async (req, res) => {
  try {
    const { email } = req.body;
    const generic = { message: "Si el correo existe, se envió un mail con instrucciones" };
    if (!email) return res.json(generic);

    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await ResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const link = `${CLIENT_URL}/reset-password?uid=${user._id}&token=${rawToken}`;

    // ⚠️ durante la prueba NO silenciamos:
    await sendResetEmail(email, link);

    return res.json(generic);
  } catch (error) {
    console.error("❗ Error enviando mail de reset:", error);
    return res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
  }
};


/**
 * POST /api/auth/reset
 * Body: { "uid": "...", "token": "...", "newPassword": "..." }
 * - Valida token y expiración
 * - Impide reutilizar la contraseña anterior
 * - Actualiza password y limpia tokens
 */
export const reset = async (req, res) => {
  try {
    const { uid, token, newPassword } = req.body;

    if (!uid || !token || !newPassword) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Buscar token
    const tokenHash = sha256(token);
    const stored = await ResetToken.findOne({ userId: uid, tokenHash });
    if (!stored) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }
    if (new Date() > stored.expiresAt) {
      return res.status(400).json({ error: "Token expirado" });
    }

    const user = await User.findById(uid);
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    // Evitar que sea la misma contraseña
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ error: "No podés usar la misma contraseña anterior" });
    }

    // Actualizar contraseña
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(uid, { password: hashed }, { new: true });

    // Limpiar todos los tokens del usuario
    await ResetToken.deleteMany({ userId: uid });

    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer contraseña", error: String(error) });
  }
};
