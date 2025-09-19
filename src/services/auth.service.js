import crypto from "crypto";
import resetDAO from "../daos/resetToken.dao.js";
import userRepo from "../repositories/user.repository.js";
import bcrypt from "bcrypt";

const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

export async function createResetToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await resetDAO.create({ userId, tokenHash, expiresAt });
  return raw; // esto es lo que se envía por email
}

export async function resetPasswordWithToken({ userId, token, newPassword }) {
  const tokenHash = sha256(token);
  const tokenDoc = await resetDAO.findByUserAndHash(userId, tokenHash);
  if (!tokenDoc || new Date() > tokenDoc.expiresAt) {
    throw new Error("Token inválido o expirado");
  }

  const user = await userRepo.getById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  // no permitir misma contraseña
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) throw new Error("No podés usar la misma contraseña anterior");

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepo.update(userId, { password: hashed });

  // limpiar tokens del usuario
  await resetDAO.deleteByUser(userId);

  return true;
}
