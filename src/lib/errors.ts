
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
  details?: any;
}

export function createAppError(
  code: AppErrorCode, 
  message: string, 
  details?: any
): AppError {
  // Log technical details to server console
  console.error(`[${code}]`, { message, details });
  
  return { code, message, details };
}

export function isAppError(error: any): error is AppError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const hasRequiredProps = 'code' in error && 'message' in error;
  if (!hasRequiredProps) {
    return false;
  }
  // Verify code is one of our known error codes or a string
  return typeof error.code === 'string' && typeof error.message === 'string';
}

/**
 * Extracts an AppError from a caught error (handles Next.js server action serialization)
 */
export function extractAppError(error: unknown): AppError | null {
  console.log('extractAppError called with:', error);
  console.log('typeof error:', typeof error);
  console.log('error instanceof Error:', error instanceof Error);
  
  // Check if it's already an AppError
  if (isAppError(error)) {
    console.log('Directly is an AppError');
    return error;
  }
  
  // Check if it's an Error object
  if (error instanceof Error) {
    console.log('Is Error object');
    console.log('error.message:', error.message);
    console.log('error.name:', error.name);
    console.log('error.stack:', error.stack);
    console.log('Object.keys(error):', Object.keys(error));
    
    // First try to parse message as JSON
    try {
      const parsed = JSON.parse(error.message);
      console.log('Parsed JSON from message:', parsed);
      if (isAppError(parsed)) {
        console.log('✓ Successfully extracted AppError from message JSON');
        return parsed;
      }
    } catch (e) {
      console.log('JSON parse of message failed:', e);
    }
    
    // Check all properties of the error object for something that looks like an AppError
    const errorObj = error as any;
    for (const key of Object.keys(errorObj)) {
      const value = errorObj[key];
      if (isAppError(value)) {
        console.log(`✓ Found AppError in property: ${key}`);
        return value;
      }
    }
    
    // Check for Next.js specific error formats
    // Next.js sometimes wraps server errors in special ways
    if (errorObj.digest) {
      console.log('Error has digest property');
    }
  }
  
  // Check if the error is an object - try various nested locations
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    
    const placesToCheck = [
      errorObj,
      errorObj.error,
      errorObj.cause,
      errorObj.data,
      errorObj.errors
    ];
    
    for (const place of placesToCheck) {
      if (isAppError(place)) {
        console.log('✓ Found AppError in nested location');
        return place;
      }
    }
    
    // If it's an array, check all elements
    if (Array.isArray(errorObj)) {
      for (const item of errorObj) {
        if (isAppError(item)) {
          console.log('✓ Found AppError in array');
          return item;
        }
      }
    }
  }
  
  console.log('✗ No AppError found in any location');
  return null;
}
