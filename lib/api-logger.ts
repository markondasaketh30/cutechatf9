import { apiLogger } from "./logger";

export function logApiRequest(
  method: string,
  path: string,
  extra?: Record<string, unknown>
) {
  apiLogger.info({ method, path, ...extra }, `${method} ${path}`);
}

export function logApiError(
  method: string,
  path: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  apiLogger.error(
    {
      method,
      path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...extra,
    },
    `${method} ${path} failed`
  );
}
