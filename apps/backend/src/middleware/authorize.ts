import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models";
import { HttpStatus } from "../utils/httpStatus";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. This action required: ${roles.join(" or ")}.`,
        },
      });
      return;
    }

    next();
  };

export const authorizeOwnerOrAdmin =
  (ownerField: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
      return;
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      req.params[ownerField] === req.user.userId ||
      req.body[ownerField] === req.user.userId;

    if (!isAdmin && !isOwner) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        },
      });
      return;
    }

    (req as any).isOwner = isOwner;
    (req as any).isAdmin = isAdmin;

    next();
  };
