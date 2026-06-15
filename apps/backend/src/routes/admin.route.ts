import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  getAnalyticsController,
  getPaymentsController,
  getStatsController,
  getUsersController,
} from "../controllers/admin.controller";

const adminRoutes = Router();

adminRoutes.get("/stats", authenticate, authorize("admin"), getStatsController);

adminRoutes.get("/users", authenticate, authorize("admin"), getUsersController);

adminRoutes.get(
  "/payments",
  authenticate,
  authorize("admin"),
  getPaymentsController,
);

adminRoutes.get(
  "/analytics",
  authenticate,
  authorize("admin"),
  getAnalyticsController,
);
export default adminRoutes;
