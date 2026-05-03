import { ReservationFilterSchema } from "@velorent/shared";
import * as ReservationService from "../services/reservation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatus } from "../utils/httpStatus";

export const createOnlineReservationController = asyncHandler(
  async (req, res) => {
    const reservation = await ReservationService.createOnlineReservation(
      req.user!.userId,
      req.body,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: reservation,
    });
  },
);

export const createWalkInReservationController = asyncHandler(
  async (req, res) => {
    const reservation = await ReservationService.createWalkInReservation(
      req.user!.userId,
      req.body,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: reservation,
    });
  },
);

export const getAllReservationController = asyncHandler(async (req, res) => {
  const rawFilters = (req as any).parsed?.query ?? req.query;

  const { reservations, pagination } =
    await ReservationService.getAllReservations(rawFilters);

  res.status(HttpStatus.OK).json({
    success: true,
    data: reservations,
    meta: pagination,
  });
});

export const getMyReservationController = asyncHandler(async (req, res) => {
  const rawFilters = (req as any).parsed?.query ?? req.query;

  const result =
    await ReservationService.getMyReservation(req.user!.userId, rawFilters);

  res.status(HttpStatus.OK).json({
    success: true,
    data: result.reservations,
    meta: result.pagination,
  });
});

export const getReservationByIdController = asyncHandler(async (req, res) => {
  const reservation = await ReservationService.getReservationById(
    req.params.id,
    req.user!.userId,
    req.user!.role,
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data: reservation,
  });
});

export const cancelReservationController = asyncHandler(async (req, res) => {
  const { reservation, needsRefund } =
    await ReservationService.cancelReservation(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body,
    );

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      reservation,
      message: needsRefund
        ? "Reservation cancelled. Refund will be processed automatically"
        : "Reservation cancelled successfully",
    },
  });
});

export const startReservationItemController = asyncHandler(async (req, res) => {
  const reservation = await ReservationService.startReservationItem(
    req.params.id,
    req.body.itemId,
    req.user!.userId,
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data: reservation,
  });
});

export const completeReservationItemController = asyncHandler(
  async (req, res) => {
    const reservation = await ReservationService.completeReservationItem(
      req.params.id,
      req.body.itemId,
      req.user!.userId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: reservation,
    });
  },
);
