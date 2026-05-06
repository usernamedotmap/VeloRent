  import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { writeLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  CancelReservationSchema,
  CompleteItemSchema,
  CreateReservationSchema,
  ReservationFilterSchema,
  StartItemSchema,
  WalkInReservationSchema,
} from "@velorent/shared";
import {
  cancelReservationController,
  completeReservationItemController,
  createOnlineReservationController,
  createWalkInReservationController,
  getAllReservationController,
  getMyReservationController,
  getReservationByIdController,
  startReservationItemController,
} from "../controllers/reservation.controller";

const reservationRoutes = Router();

// customer
reservationRoutes.post(
  "/create/online",
  authenticate,
  authorize("customer"),
  writeLimiter,
  validate(CreateReservationSchema),
  createOnlineReservationController,
);

reservationRoutes.get(
  "/my",
  authenticate,
  authorize("customer"),
  writeLimiter,
  validate(ReservationFilterSchema),
  getMyReservationController,
);

// admin and operator
reservationRoutes.post(
  "/create/walk-in",
  authenticate,
  authorize("admin", "operator"),
  writeLimiter,
  validate(WalkInReservationSchema),
  createWalkInReservationController,
);

reservationRoutes.get(
  "/all",
  authenticate,
  authorize("admin", "operator"),
  writeLimiter,
  validate(ReservationFilterSchema, "query"),
  getAllReservationController,
);

reservationRoutes.patch(
  "/:id/start-item",
  authenticate,
  authorize("admin", "operator"),
  validate(StartItemSchema),
  startReservationItemController,
);

reservationRoutes.patch(
  "/:id/complete-item",
  authenticate,
  authorize("admin", "operator"),
  validate(CompleteItemSchema),
  completeReservationItemController,
);

// for customer that autehntiated
reservationRoutes.get("/:id", authenticate, getReservationByIdController);

reservationRoutes.patch(
  "/:id/cancel",
  authenticate,
  validate(CancelReservationSchema),
  cancelReservationController,
);

export default reservationRoutes;
