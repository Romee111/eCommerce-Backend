import { orderModel } from "../../../Database/models/order.model.js";
import { productModel } from "./../../../Database/models/product.model.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { userModel } from "../../../Database/models/user.model.js";
// const trafficModel = require('../models/trafficModel'); // Assuming a model for traffic data
// const promotionModel = require('../models/promotionModel');

// Order Overview (Total orders, Pending orders, Completed orders)
const getOrderOverview = catchAsyncError(async (req, res, next) => {
  const sellerId = req.user.role === 'admin' ? null : req.user._id;

  const totalOrders = await orderModel.countDocuments({ sellerId });
  const pendingOrders = await orderModel.countDocuments({ sellerId, status: 'pending' });
  const completedOrders = await orderModel.countDocuments({ sellerId, status: 'completed' });

  res.status(200).json({
    message: "success",
    data: { totalOrders, pendingOrders, completedOrders },
  });
});

// Sales Overview (Total sales, Sales by product)
const getSalesOverview = catchAsyncError(async (req, res, next) => {
  const sellerId = req.user.role === 'admin' ? null : req.user._id;

  const totalSales = await orderModel.aggregate([
    { $match: sellerId ? { sellerId } : {} },
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
  ]);

  const salesByProduct = await orderModel.aggregate([
    { $match: sellerId ? { sellerId } : {} },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 } // Top 5 sold products
  ]);

  res.status(200).json({
    message: "success",
    data: { totalSales, salesByProduct },
  });
});

// Revenue Breakdown (Total revenue, Revenue by month)
const getRevenueBreakdown = catchAsyncError(async (req, res, next) => {
  const sellerId = req.user.role === 'admin' ? null : req.user._id;

  const revenueByMonth = await orderModel.aggregate([
    { $match: sellerId ? { sellerId } : {} },
    { $group: { _id: { $month: "$createdAt" }, totalRevenue: { $sum: "$totalPrice" } } },
    { $sort: { _id: 1 } } // Sort by month
  ]);

  res.status(200).json({
    message: "success",
    data: revenueByMonth,
  });
});

// Customer Demographics (Total customers, Gender, Age group)
const getCustomerDemographics = catchAsyncError(async (req, res, next) => {
  const sellerId = req.user.role === 'admin' ? null : req.user._id;

  const customerData = await userModel.aggregate([
    { $match: sellerId ? { sellerId } : {} },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        maleCustomers: { $sum: { $cond: [{ $eq: ["$gender", "male"] }, 1, 0] } },
        femaleCustomers: { $sum: { $cond: [{ $eq: ["$gender", "female"] }, 1, 0] } },
      },
    },
  ]);

  res.status(200).json({
    message: "success",
    data: customerData,
  });
});

// Traffic Source (Traffic data from various sources)
// const getTrafficSource = catchAsyncError(async (req, res, next) => {
//   const trafficData = await trafficModel.aggregate([
//     {
//       $group: {
//         _id: "$source",
//         totalVisits: { $sum: 1 }
//       }
//     },
//     { $sort: { totalVisits: -1 } }
//   ]);

//   res.status(200).json({
//     message: "success",
//     data: trafficData,
//   });
// });

// Inventory Levels (Current stock levels for products)
const getInventoryLevel = catchAsyncError(async (req, res, next) => {
  const sellerId = req.user.role === 'admin' ? null : req.user._id;

  const inventoryLevels = await productModel.aggregate([
    { $match: sellerId ? { sellerId } : {} },
    { $project: { name: 1, stock: 1 } }
  ]);

  res.status(200).json({
    message: "success",
    data: inventoryLevels,
  });
});

// // Promotion Performance (How well promotions are performing)
// const getPromotionPerformance = catchAsyncError(async (req, res, next) => {
//   const promotions = await promotionModel.aggregate([
//     {
//       $lookup: {
//         from: "orders",
//         localField: "_id",
//         foreignField: "promotionId",
//         as: "orders"
//       }
//     },
//     {
//       $project: {
//         promotionName: 1,
//         totalOrders: { $size: "$orders" },
//         totalRevenue: { $sum: "$orders.totalPrice" }
//       }
//     }
//   ]);

//   res.status(200).json({
//     message: "success",
//     data: promotions,
//   });
// });

module.exports = {
  getOrderOverview,
  getSalesOverview,
  getRevenueBreakdown,
  getCustomerDemographics,
  getInventoryLevel,

};
