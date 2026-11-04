import type { components } from './schema';

type ErrorBody = components['schemas']['Error'];

/** Thrown by every hook so screens can branch on status (e.g. 403 → permission-denied state). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, body?: Partial<ErrorBody> | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.isForbidden;
}

/** Unwrap an openapi-fetch result, throwing ApiError on failure. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (!result.response.ok || result.error !== undefined) {
    throw new ApiError(result.response.status, result.error as Partial<ErrorBody> | null);
  }
  return result.data as T;
}
