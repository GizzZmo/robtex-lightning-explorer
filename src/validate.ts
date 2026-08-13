import { z } from 'zod';

/** Portable issue shape (avoids Zod 3/4 internal path differences). */
export type ValidationIssue = {
  path: PropertyKey[];
  message: string;
  code?: string;
};

/**
 * Thrown when Robtex API response fails Zod validation.
 */
export class RobtexValidationError extends Error {
  readonly issues: ValidationIssue[];
  readonly context: string;
  readonly raw: unknown;

  constructor(context: string, error: z.ZodError, raw?: unknown) {
    const issues: ValidationIssue[] = error.issues.map((i) => ({
      path: i.path as PropertyKey[],
      message: i.message,
      code: String((i as { code?: string }).code ?? ''),
    }));
    const summary = issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    super(`Invalid Robtex response for ${context}: ${summary}`);
    this.name = 'RobtexValidationError';
    this.context = context;
    this.issues = issues;
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
