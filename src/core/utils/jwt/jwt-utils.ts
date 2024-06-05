import { createHmac } from 'crypto';
import { DTO } from '../../../domain/dto.js';
import { urlUtils } from '../url/url-utils.js';

export class JwtHmacHashUtils<T extends DTO | string> {
  /** returned jwt token */
  sign(payload: T, secretKey: string, algorithm: 'sha256' | 'sha512'): string {
    const alg = algorithm === 'sha256' ? 'HS256' : 'HS512';
    const headerAsBase64 = urlUtils.encodeToBase64Url({ alg, typ: 'JWT' });
    const payloadAsBase64 = urlUtils.encodeToBase64Url(payload);
    const headerAndPayloadAsBase64 = `${headerAsBase64}.${payloadAsBase64}`;
    const signAsBase64 = this.getHmacSign(headerAndPayloadAsBase64, secretKey, algorithm);
    return `${headerAndPayloadAsBase64}.${signAsBase64}`;
  }

  /** verify jwt token by secret key and return result */
  verify(raw: string, secretKey: string, algorithm: 'sha256' | 'sha512'): boolean {
    const headerAndPayloadAsBase64 = raw.replace(/\.[^.]+$/gm, '');
    const signAsBase64 = this.getHmacSign(headerAndPayloadAsBase64, secretKey, algorithm);
    return raw === `${headerAndPayloadAsBase64}.${signAsBase64}`;
  }

  /** return jwt token payload */
  getPayload(raw: string): T | undefined {
    const payloadAsBase64 = raw.split('.')[1];
    if (!payloadAsBase64) return undefined;
    return urlUtils.decodeFromBase64Url(payloadAsBase64) as T;
  }

  protected getHmacSign(payload: string, secretKey: string, algorithm: 'sha256' | 'sha512'): string {
    const hmac = createHmac(algorithm, secretKey);
    hmac.update(payload);
    return hmac.digest('base64url');
  }
}

export const jwtHmacHashUtils = new JwtHmacHashUtils();
