// src/services/mail.service.js
import nodemailer from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: String(EMAIL_SECURE).toLowerCase() === "true",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  logger: true,   // 🔎 loggea en consola
  debug: true,    // 🔎 más detalle SMTP
});

export async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log("📬 SMTP listo para enviar correos");
  } catch (err) {
    console.warn("⚠️  No se pudo verificar SMTP:", err?.message || err);
  }
}

export async function sendResetEmail(to, link) {
  const from = EMAIL_FROM || EMAIL_USER;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.4;">
      <h2>Recuperación de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${link}"
           style="background:#0d6efd;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no solicitaste esto, podés ignorar este correo.</p>
      <hr/>
      <p style="color:#666;font-size:12px;">Si el botón no funciona, copia y pega este enlace:<br/>
        <a href="${link}">${link}</a>
      </p>
    </div>
  `;

  const text = `Recuperación de contraseña.
Enlace (válido 1 hora): ${link}
Si no solicitaste esto, ignora este correo.`;

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Recuperación de contraseña",
    text,
    html,
  });

  console.log("✉️  Mail enviado. messageId:", info.messageId);
}
