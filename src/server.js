// Cargar .env ANTES de cualquier otra import
import "dotenv/config";

import { verifyTransporter } from "./services/mail.service.js";

verifyTransporter();

import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/product.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();
app.use(express.json());

connectDB();

// Endpoints base
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/cart", cartRoutes);

// (opcional) ping
app.get("/", (_, res) => res.send("Servidor funcionando 🚀"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
