import { z } from "zod";

/**
 * Base model schema — reusable for other models
 * createdAt and updatedAt are required and are Date objects
 */
export const baseModelSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Scope enum
 */
export const scopeEnum = z.enum(["account", "prospect", "child"]);

/**
 * Payload schema for create/update — strict to forbid extra fields (like createdAt/updatedAt)
 * This schema is used in middleware to validate client payload.
 */
export const accountPayloadSchema = z
  .object({
    name: z.string().min(1),
    scope: scopeEnum
  })
  .strict();

/**
 * Full account schema (for server-side final validation and type inference)
 */
export const accountSchema = baseModelSchema.merge(
  z.object({
    name: z.string(),
    scope: scopeEnum
  })
);

/**
 * Types
 */
export type Account = z.infer<typeof accountSchema>;
export type AccountPayload = z.infer<typeof accountPayloadSchema>;

