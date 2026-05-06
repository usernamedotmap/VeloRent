import * as BikeService from "../services/bike.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatus } from "../utils/httpStatus";

export const getAllBikesController = asyncHandler(async (req, res) => {
  const result = await BikeService.getAllBikes(req.query as any);

  res.status(HttpStatus.OK).json({
    success: true,
    data: result.bikes,
    meta: result.pagination,
  });
});

export const getBikeByIdController = asyncHandler(async (req, res) => {
 
  const bike = await BikeService.getBikeById(req.params.id as string);

  res.status(HttpStatus.OK).json({
    success: true,
    data: bike,
  });
});

export const createBikeController = asyncHandler(async (req, res) => {
  const bike = await BikeService.createBike(req.body);

  res.status(HttpStatus.CREATED).json({
    success: true,
    data: bike,
  });
});

export const updateBikeController = asyncHandler(async (req, res) => {
  const bike = await BikeService.updateBike(req.params.id as string, req.body);

  res.status(HttpStatus.OK).json({
    success: true,
    data: bike,
  });
});

export const updateBikeStatusController = asyncHandler(async (req, res) => {
  const bike = await BikeService.updateBikeStatus(
    req.params.id as string,
    req.body,
  );

  res.status(HttpStatus.OK).json({
    success: true,
    data: bike,
  });
});

export const retireBikeController = asyncHandler(async (req, res) => {
  const bike = BikeService.retireBike(req.params.id as string);

  res.status(HttpStatus.OK).json({
    success: true,
    data: bike,
  });
});
