// backend/controllers/orderController.js
const Order = require("../models/Order");

async function createOrder(req, res, next) {
  try {
    const body = req.body || {};
    const userId = req.user?._id || body.user;
    const order = await Order.create({
      user: userId,
      items: body.items || [],
      total: body.total || 0,
      status: body.status || "pending",
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
    });
    res.status(201).json(order);
  } catch (e) { next(e); }
}

async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt").lean();
    res.json(orders);
  } catch (e) { next(e); }
}

async function listAllOrders(req, res, next) {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const orders = await Order.find(q).sort("-createdAt").lean();
    res.json(orders);
  } catch (e) { next(e); }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    const isOwner = order.user?.toString?.() === req.user._id.toString();
    const admin = req.user.role === "admin";
    if (!isOwner && !admin) return res.status(403).json({ message: "Forbidden" });
    res.json(order);
  } catch (e) { next(e); }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params, { status } = req.body || {};
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (e) { next(e); }
}

async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await Order.findByIdAndDelete(id).lean();
    if (!removed) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true });
  } catch (e) { next(e); }
}

module.exports = {
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
