import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../shared/auth';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function requireValue(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new HttpError(status, message);
}
export function text(value: unknown, label: string, max = 200, required = true): string {
  requireValue(value === undefined || typeof value === 'string', `${label} tidak valid`);
  const result = typeof value === 'string' ? value.trim() : '';
  requireValue((!required || result.length > 0) && result.length <= max, `${label} wajib diisi (maks. ${max} karakter)`);
  return result;
}
export function email(value: unknown): string {
  const result = text(value, 'Email', 254).toLowerCase();
  requireValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result), 'Email tidak valid');
  return result;
}
export function money(value: unknown, positive = true): number {
  requireValue(typeof value === 'number' && Number.isSafeInteger(value) && Math.abs(value) <= 1e12 && (!positive || value > 0), 'Nominal harus bilangan bulat rupiah yang valid');
  return value;
}
export function isValidPassword(value: unknown): value is string {
  return typeof value==='string' && value.trim().length>0 && value.length>=MIN_PASSWORD_LENGTH && value.length<=MAX_PASSWORD_LENGTH;
}
export function password(value: unknown): string {
  requireValue(isValidPassword(value), `Kata sandi harus ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} karakter dan tidak boleh hanya spasi`);
  return value;
}
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
export async function digest(value: string) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}
export async function secretsEqual(actual: string, expected: string) {
  const [a,b] = await Promise.all([digest(actual),digest(expected)]);
  let difference = 0;
  for (let i=0; i<a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
async function derive(value: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(value), 'PBKDF2', false, ['deriveBits']);
  // Workers WebCrypto supports at most 100,000 PBKDF2 iterations.
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:new TextEncoder().encode(salt), iterations:100000}, key, 256));
}
export async function hashPassword(value: string) {
  const salt = crypto.randomUUID();
  return `pbkdf2-sha256$100000$${salt}$${await derive(value, salt)}`;
}
export async function verifyPassword(value: string, stored: string | null) {
  if (!stored) return false;
  const [algorithm, iterations, salt, expected] = stored.split('$');
  if (algorithm !== 'pbkdf2-sha256' || iterations !== '100000' || !salt || !expected) return false;
  const actual = await derive(value, salt);
  let difference = actual.length ^ expected.length;
  for (let i=0; i<actual.length; i++) difference |= actual.charCodeAt(i) ^ (expected.charCodeAt(i) || 0);
  return difference === 0;
}
export function csvCell(value: unknown) {
  let result = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(result)) result = `'${result}`;
  return `"${result.replaceAll('"', '""')}"`;
}
