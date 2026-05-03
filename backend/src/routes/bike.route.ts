import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  BikeFilterSchema,
  BikeStatusSchema,
  CreateBikeSchema,
  UpdateBikeSchema,
} from "@velorent/shared";
import {
  createBikeController,
  getAllBikesController,
  getBikeByIdController,
  retireBikeController,
  updateBikeController,
  updateBikeStatusController,
} from "../controllers/bike.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { writeLimiter } from "../middleware/rateLimiter";

const bikeRoutes = Router();

// get method and public route
bikeRoutes.get(
  "/all",
  validate(BikeFilterSchema, "query"),
  getAllBikesController,
);

bikeRoutes.get("/:id", getBikeByIdController);


// create etmod and protected route (admin only)
bikeRoutes.post(
  "/create",
  authenticate,
  authorize("admin"),
  writeLimiter,
  validate(CreateBikeSchema),
  createBikeController,
);
bikeRoutes.patch(
  "/:id/update",
  authenticate,
  authorize("admin"),
  writeLimiter,
  validate(UpdateBikeSchema),
  updateBikeController,
);
bikeRoutes.delete(
  "/:id/delete",
  authenticate,
  authorize("admin"),
  retireBikeController,
);

// update status  and protected route (admin and operator)
bikeRoutes.patch(
  "/:id/status/",
  authenticate,
  authorize("admin", "operator"),
  writeLimiter,
  validate(BikeStatusSchema),
  updateBikeStatusController,
);

export default bikeRoutes;
