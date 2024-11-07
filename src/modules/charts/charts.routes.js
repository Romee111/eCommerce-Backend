import express from "express";
import * as chart from "../charts/charts.controller.js";

import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const chartRouter = express.Router();

const {
  getOrderOverview,
  getSalesOverview,
  getRevenueBreakdown,
  getCustomerDemographics,
  getTrafficSource,
  getInventoryLevel,
  getPromotionPerformance,
} = chart;

// Protect all routes under this router
chartRouter.use(protectedRoutes);

// Get Order Overview
chartRouter.get('/order-overview', allowedTo('admin', 'seller'), getOrderOverview);

// Get Sales Overview
chartRouter.get('/sales-overview', allowedTo('admin', 'seller'), getSalesOverview);

// Get Revenue Breakdown
chartRouter.get('/revenue-breakdown', allowedTo('admin', 'seller'), getRevenueBreakdown);

// Get Customer Demographics
chartRouter.get('/customer-demographics', allowedTo('admin', 'seller'), getCustomerDemographics);

// Get Traffic Source
chartRouter.get('/traffic-source', allowedTo('admin', 'seller'), getTrafficSource);

// Get Inventory Level
chartRouter.get('/inventory-level', allowedTo('admin', 'seller'), getInventoryLevel);

// Get Promotion Performance
chartRouter.get('/promotion-performance', allowedTo('admin', 'seller'), getPromotionPerformance);

export default chartRouter;
