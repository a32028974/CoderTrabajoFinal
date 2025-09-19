// src/services/auth.service.js
import crypto from "crypto";
import bcrypt from "bcrypt";
import userRepo from "../repositories/user.repository.js";
import resetTokenDao from "../daos/resetToken.dao.js";
import { sendResetEmail } from "./mail.service.js";

const ONE_HOUR_MS = 60 * 60 * 1000;

function hashToken(plain) {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

/**
 * Genera un token de reset (validez 1 hora), borra tokens previos del user
 * y envía el correo con el enlace.
 */
export async function requestPasswordReset(email) {
  const user = await userRepo.getByEmail(email);
  // Nunca revelar si existe o no el email.
  if (!user) return;

  // eliminar tokens anteriores de este usuario
  await resetTokenDao.deleteByUser(user._id);

  // token plano para el link + hash para DB
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

  await resetTokenDao.create({ userId: user._id, tokenHash, expiresAt });

  // Link para el front: <CLIENT_URL>/reset/<token>
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const link = `${base}/reset/${token}`;

  await sendResetEmail(user.email, link);
}

/**
 * Valida token, evita reutilizar la misma contraseña y actualiza la password.
 * Borra todos los tokens del usuario luego de usarlo.
 */
export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);

  // Buscar el token en DB (vigente)
  const tokenDoc = await resetTokenDao.findByHash(tokenHash);
  if (!tokenDoc) {
    throw new Error("Token inválido o expirado");
  }

  const user = await userRepo.getById(tokenDoc.userId);
  if (!user) {
    // por las dudas, eliminamos los tokens del doc huérfano
    await resetTokenDao.deleteByUser(tokenDoc.userId);
    throw new Error("Usuario no encontrado");
  }

  // Evitar reutilizar la misma contraseña
  const same = await bcrypt.compare(newPassword, user.password);
  if (same) {
    throw new Error("La nueva contraseña no puede ser igual a la anterior");
  }

  // Hashear y actualizar
  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepo.updatePassword(user._id, hashed);

  // Limpiar tokens del usuario (este y cualquiera previo)
  await resetTokenDao.deleteByUser(user._id);

  return true;
}
