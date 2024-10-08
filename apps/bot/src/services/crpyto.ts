import crypto from 'node:crypto';
import { env } from '~/env';

export default class EncodingService {
  private static instance: EncodingService;

  public static getInstance(): EncodingService {
    if (!EncodingService.instance) {
      EncodingService.instance = new EncodingService();
    }

    return EncodingService.instance;
  }

  private constructor() {};

  encoding: BufferEncoding = 'hex';
  
  private key = Uint8Array.from(crypto.scryptSync(env.AUTH_SECRET, 'salt', 32));

  isEncrypted(text: string): boolean {
    return text.includes(':');
  }
  
  private splitEncryptedText(encryptedText: string): [string, string] {
    const [iv, encrypted] = encryptedText.split(':');
    if (!iv || !encrypted) return ['', encryptedText];
    return [iv, encrypted];
  }

  private toHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  encrypt(plaintext: string): string {
    const iv = Uint8Array.from(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    
    const encrypted = Buffer.concat([
      Uint8Array.from(cipher.update(plaintext, 'utf-8')),
      Uint8Array.from(cipher.final()),
    ]);
    
    return `${this.toHex(iv)}:${encrypted.toString(this.encoding)}`;
  }
  
  decrypt(cipherText: string): string {
    const [ivString, encryptedDataString] = this.splitEncryptedText(cipherText);

    if (!ivString || !encryptedDataString) return cipherText;
    
    const iv = Uint8Array.from(Buffer.from(ivString, this.encoding));
    const encryptedData = Uint8Array.from(Buffer.from(encryptedDataString, this.encoding));

    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decrypted = Buffer.concat([
      Uint8Array.from(decipher.update(encryptedData)),
      Uint8Array.from(decipher.final()),
    ]);

    return decrypted.toString('utf-8');
  }
}