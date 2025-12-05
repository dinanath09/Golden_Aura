// backend/routes/orders.js
const router = require("express").Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

router.get("/:id", protect, async (req,res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({message:"Order not found"});
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({message:"Forbidden"});
  res.json(order);
});

module.exports = router;
