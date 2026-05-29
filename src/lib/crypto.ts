/**
 * Generates a cryptographically secure random string of a given length.
 * Works in both browser and Node.js environments using the Web Crypto API.
 */
export function generateSecureRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint32Array(length);
  globalThis.crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  
  return result;
}

/**
 * Generates a cryptographically secure random integer between min and max (inclusive).
 * Works in both browser and Node.js environments using the Web Crypto API.
 */
export function generateSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return min + (array[0] % range);
}
