import crypto from 'crypto';

export function generateRandomString(size: number): string {
  return crypto
    .randomBytes(size / 2)
    .toString('hex')
    .toUpperCase();
}
