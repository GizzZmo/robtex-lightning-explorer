import type { z } from 'zod';

/**
 * Thrown when Robtex API response fails Zod validation.
 */
export class RobtexValidationError extends Error {
  readonly issues: z.core.$ZodIssue[];
  readonly context: string;
  readonly raw: unknown;

  constructor(context: string, error: z.ZodError, raw?: unknown) {
    const summary = error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    super(`Invalid Robtex response for ${context}: ${summary}`);
    this.name = 'RobtexValidationError';
    this.context = context;
    this.issues = error.issues;
    this.raw = raw;
  }
}

/**
 * Parse unknown data with a Zod schema.
 * Throws RobtexValidationError on failure.
 */
export function parseResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  context: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new RobtexValidationError(context, result.error, data);
  }
  return result.data;
}

/**
 * Soft-parse: returns data on success, or null + logs on failure.
 * Useful when you prefer not to crash on shape drift.
 */
export function tryParseResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  context: string,
): z.infer<T> | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(
      `[robtex-ln] validation warning (${context}):`,
      result.error.issues.slice(0, 3),
    );
    return null;
  }
  return result.data;
}
