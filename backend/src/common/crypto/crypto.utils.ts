import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';
import * as util from 'util';
import * as crypto from 'crypto';
export function encryptPrivateKey(privateKey: string, password: string) {
  const salt = randomBytes(16);
  const iv = randomBytes(16);
  const key = pbkdf2Sync(password, salt, 100_000, 32, 'sha256');
  const cipher = createCipheriv('aes-256-cbc', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final(),
  ]);

  return {
    encryptedPrivateKey: encrypted.toString('hex'),
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
  };
}

export function decryptPrivateKey(
  encryptedPrivateKey: string,
  password: string,
  saltHex: string,
  ivHex: string,
): string {
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const key = pbkdf2Sync(password, salt, 100_000, 32, 'sha256');

  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPrivateKey, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export async function generateRsaKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
  const generateKeyPair = util.promisify(crypto.generateKeyPair);
  return generateKeyPair('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}