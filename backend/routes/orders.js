// backend/routes/orders.js
const router = require("express").Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

// Get current user's orders: /api/orders/mine
router.get("/mine", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
});

// Get single order by id: /api/orders/:id
router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only owner can see this order
    if (
      order.user &&
      String(order.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(order);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
