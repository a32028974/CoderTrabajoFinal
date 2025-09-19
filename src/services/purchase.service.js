// src/services/purchase.service.js
import cartRepo from "../repositories/cart.repository.js";
import productRepo from "../repositories/product.repository.js";
import ticketRepo from "../repositories/ticket.repository.js";
import userRepo from "../repositories/user.repository.js";
import crypto from "crypto";

/**
 * Agregar producto al carrito (solo role "user", lo controla la ruta)
 */
export async function addToCart(userId, productId, quantity = 1) {
  const cart = await cartRepo.getOrCreateByUser(userId);

  const idx = cart.items.findIndex(i => String(i.product) === String(productId));
  if (idx >= 0) {
    cart.items[idx].quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }

  await cartRepo.update(cart._id, { items: cart.items });
  return await cartRepo.getByUser(userId);
}

/**
 * Comprar: valida stock, descuenta, genera ticket y deja en el carrito lo no comprado
 */
export async function purchase(userId) {
  const cart = await cartRepo.getOrCreateByUser(userId);
  if (!cart.items || cart.items.length === 0) {
    return { ticket: null, notPurchased: [], amount: 0 };
  }

  const purchased = [];
  const notPurchased = [];
  let amount = 0;

  for (const item of cart.items) {
    const product = await productRepo.findById(item.product);
    if (!product) {
      notPurchased.push({ product: item.product, quantity: item.quantity, reason: "Producto inexistente" });
      continue;
    }
    if (product.stock < item.quantity) {
      notPurchased.push({ product: product._id, title: product.name, quantity: item.quantity, reason: "Stock insuficiente" });
      continue;
    }

    // Descontar stock (simple)
    await productRepo.decreaseStock(product._id, item.quantity);

    const lineTotal = product.price * item.quantity;
    amount += lineTotal;
    purchased.push({
      product: product._id,
      title: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: lineTotal,
    });
  }

  let ticket = null;

  if (purchased.length > 0) {
    const user = await userRepo.getById(userId);
    ticket = await ticketRepo.create({
      code: crypto.randomUUID(),
      amount,
      purchaser: user?.email || "unknown",
      products: purchased,
    });
  }

  // Dejar solo lo no comprado en el carrito
  cart.items = notPurchased.map(i => ({ product: i.product, quantity: i.quantity }));
  await cartRepo.update(cart._id, { items: cart.items });

  return { ticket, notPurchased, amount };
}
