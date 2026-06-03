
export type AppErrorCode = 
  | 'duplicate_registration_number' 
  | 'duplicate_username' 
  | 'unauthorized' 
  | 'invalid_data' 
  | 'student_not_found' 
  | 'class_has_students' 
  | 'cannot_delete_superadmin'
  | 'unknown_error';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
}

const APP_ERROR_CODE_PATTERN =
  /"code"\s*:\s*"(duplicate_registration_number|duplicate_username|unauthorized|invalid_data|student_not_found|class_has_students|cannot_delete_superadmin|unknown_error)"/;

export function createAppError(
  code: AppErrorCode, 
  message: string, 
  details?: unknown
): AppError {
  console.error(`[${code}]`, { message, details });
  return { code, message, details };
}

/**
 * Throws an Error that survives Next.js server-action serialization.
 * Technical details stay in server logs only; the client receives code + message.
 */
export function throwAppError(
  code: AppErrorCode,
  message: string,
  details?: unknown
): never {
  createAppError(code, message, details);
  const payload = JSON.stringify({ code, message });
  const error = new Error(payload);
  error.name = 'AppError';
  throw error;
}

export function isAppError(error: unknown): error is AppError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const record = error as Record<string, unknown>;
  return typeof record.code === 'string' && typeof record.message === 'string';
}

function isUserFriendlyMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return false;
  if (trimmed.includes('digest:')) return false;
  if (trimmed.includes(' at ') && trimmed.includes('.ts')) return false;
  if (trimmed.length > 500) return false;
  return true;
}

function tryParseAppErrorJson(text: string): AppError | null {
  const trimmed = text.trim();
  const candidates = [
    trimmed,
    trimmed.replace(/^Error:\s*/i, ''),
  ];

  for (const candidate of candidates) {
    if (!candidate.includes('"code"')) continue;

    const jsonStart = candidate.indexOf('{');
    const jsonEnd = candidate.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd <= jsonStart) continue;

    const jsonSlice = candidate.slice(jsonStart, jsonEnd + 1);
    try {
      const parsed = JSON.parse(jsonSlice) as unknown;
      if (isAppError(parsed) && isUserFriendlyMessage(parsed.message)) {
        return { code: parsed.code, message: parsed.message.trim() };
      }
    } catch {
      // try next candidate
    }
  }

  const codeMatch = trimmed.match(APP_ERROR_CODE_PATTERN);
  if (codeMatch) {
    const messageMatch = trimmed.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (messageMatch) {
      const message = messageMatch[1].replace(/\\"/g, '"').trim();
      if (isUserFriendlyMessage(message)) {
        return {
          code: codeMatch[1] as AppErrorCode,
          message,
        };
      }
    }
  }

  return null;
}

function findAppErrorDeep(value: unknown, depth = 0, seen = new Set<unknown>()): AppError | null {
  if (depth > 6 || value == null) return null;
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.has(value)) return null;
    seen.add(value);
  }

  if (isAppError(value)) {
    return { code: value.code, message: value.message.trim() };
  }

  if (typeof value === 'string') {
    const fromJson = tryParseAppErrorJson(value);
    if (fromJson) return fromJson;
    return null;
  }

  if (value instanceof Error) {
    return (
      findAppErrorDeep(value.message, depth + 1, seen) ??
      findAppErrorDeep((value as Error & { cause?: unknown }).cause, depth + 1, seen)
    );
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAppErrorDeep(item, depth + 1, seen);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['message', 'error', 'cause', 'data', 'err', 'value']) {
      if (key in record) {
        const found = findAppErrorDeep(record[key], depth + 1, seen);
        if (found) return found;
      }
    }
    for (const nested of Object.values(record)) {
      const found = findAppErrorDeep(nested, depth + 1, seen);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extracts an AppError from a caught error (handles Next.js server action serialization).
 */
export function extractAppError(error: unknown): AppError | null {
  return findAppErrorDeep(error);
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Resolves a user-facing message from a caught error.
 * Always prioritizes the backend `message` field when present.
 */
export function getUserFacingErrorMessage(
  error: unknown,
  t: TranslateFn,
  fallbackKey = 'common.errorDescription'
): string {
  const appError = extractAppError(error);

  if (appError?.message && isUserFriendlyMessage(appError.message)) {
    return appError.message;
  }

  if (appError?.code) {
    const dictKey = `errors.${appError.code}`;
    const fromDictionary = t(dictKey);
    const missingKeyLabel = appError.code
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (fromDictionary !== missingKeyLabel && !fromDictionary.includes('.')) {
      return fromDictionary;
    }
  }

  return t(fallbackKey);
}
