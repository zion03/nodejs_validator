import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * validate(schema) - middleware to validate req.body using a Zod schema
 * On error returns 400 with zod issues structure
 */
export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      // Map issues to readable format
      const issues = parsed.error.issues.map((it) => ({
        path: it.path.join("."),
        message: it.message,
        code: it.code
      }));
      return res.status(400).json({ errors: issues });
    }

    // assign parsed data back to req.body (typed)
    req.body = parsed.data;
    return next();
  };
};
