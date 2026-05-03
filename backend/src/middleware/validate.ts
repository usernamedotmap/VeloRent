import { NextFunction, Request, Response } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { HttpStatus } from "../utils/httpStatus";

type ValidateTarget = "body" | "query" | "params";

export const validate =
  (schema: z.ZodType, target: ValidateTarget = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((e: ZodError['errors'][number]) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(HttpStatus.UNPROCESSABLE).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors,
        },
      });
      return;
    }

    (req as any)[target] = result.data;
    next();
  };

export const validateMultiple =
  (schemas: Partial<Record<ValidateTarget, ZodSchema>>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const allErrors: { field: string; message: string }[] = [];

    for (const [target, schema] of Object.entries(schemas) as [
      ValidateTarget,
      ZodSchema,
    ][]) {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errors = result.error.errors  .map((e) => ({
          field: `${target}.${e.path.join(".")}`,
          message: e.message,
        }));
        allErrors.push(...errors);
      } else {
        (req as any)[target] = result.data;
      }
    }

    if (allErrors.length > 0) {
      res.status(HttpStatus.UNPROCESSABLE).json({
        success: false,
        error: {
          code: "VALIATION_ERROR",
          message: "Validation failed. Please check your input",
          errors: allErrors,
        },
      });
      return;
    }

    next();
  };
