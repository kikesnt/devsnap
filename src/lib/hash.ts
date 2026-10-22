/**
 * Digests and checksums.
 *
 * SHA family and HMAC use the Web Crypto API, which is only exposed in a
 * secure context (https or localhost). CRC and the Fletcher checksums are
 * implemented directly because they are simple enough to be exact and they
 * have to work identically everywhere.
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export function hasSubtleCrypto(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function toBase64Url(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function hashText(
  text: string,
  algorithm: HashAlgorithm,
  encoding: 'hex' | 'base64' = 'hex'
): Promise<string> {
  if (!hasSubtleCrypto()) {
    throw new Error('Web Crypto is unavailable. Open the page over https or on localhost.');
  }
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data);
  return encoding === 'hex' ? toHex(digest) : toBase64(digest);
}

export async function hmacText(
  text: string,
  key: string,
  algorithm: HashAlgorithm,
  encoding: 'hex' | 'base64' = 'hex'
): Promise<string> {
  if (!hasSubtleCrypto()) {
    throw new Error('Web Crypto is unavailable. Open the page over https or on localhost.');
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(text));
  return encoding === 'hex' ? toHex(signature) : toBase64(signature);
}

/* -------------------------------------------------------------------------- */
/* CRC-32 (IEEE 802.3, the polynomial used by ZIP and PNG)                    */
/* -------------------------------------------------------------------------- */

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

export function fletcher16(bytes: Uint8Array): number {
  let sum1 = 0;
  let sum2 = 0;
  for (const byte of bytes) {
    sum1 = (sum1 + byte) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return ((sum2 << 8) | sum1) & 0xffff;
}

export type ChecksumAlgorithm = 'crc32' | 'adler32' | 'fletcher16';

export function checksum(bytes: Uint8Array, algorithm: ChecksumAlgorithm): number {
  if (algorithm === 'crc32') return crc32(bytes);
  if (algorithm === 'adler32') return adler32(bytes);
  return fletcher16(bytes);
}

export function toHexNumber(value: number, width: number): string {
  return value.toString(16).toUpperCase().padStart(width, '0');
}

export function bytesOf(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
