import { User } from "../models";
import { Errors } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatus } from "../utils/httpStatus";

export const registerRfidController = asyncHandler(async (req, res) => {
  const { rfidUid } = req.body;
  const userId = req.user!.userId;

  // checking for if uid is already kuha
  const existing = await User.findOne({ rfidUid });
  if (existing && String(existing._id) !== userId) {
    throw Errors.badRequest(
      "This RFID card is already registered to another account.",
    );
  }

  await User.findByIdAndUpdate(userId, { rfidUid });

  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      message: "RFID card registered successfully",
    },
  });
});
