// backend/controllers/adminController.js
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

async function getStats(_req, res, next) {
  try {
    const [products, orders, users, revenueAgg, last7] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),

      // FIXED: use "amount" instead of "total"
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
        { $project: { _id: 0, total: 1 } }
      ]),

      // FIXED: use "amount" here also
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const revenue = revenueAgg?.[0]?.total || 0;

    res.json({
      products,
      orders,
      users,
      revenue,
      sevenDay: (last7 || []).map(d => ({ day: d._id, total: d.total })),
    });

  } catch (e) {
    next(e);
  }
}

module.exports = { getStats };
