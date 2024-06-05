import { describe, expect, test } from 'bun:test';
import { JwtHmacHashUtils } from './jwt-utils.js';

describe('jwt hmac utils tests', () => {
  const sut = new JwtHmacHashUtils();

  test('success, sign jwt and result payload checked', () => {
    const result = sut.sign(
      { userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' },
      'your-256-bit-secret',
      'sha256',
    );
    const expectResult = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQifQ.s2q8Nu1InSupAFVCM3tK4F14fJAZXGnOY03JcZuLSlQ';
    expect(result).toBe(expectResult);
    expect(sut.getPayload(result)).toEqual({ userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' });
  });

  describe('verify jwt tests', () => {
    test('success, jwt is success verified', () => {
      const result = sut.verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQifQ.s2q8Nu1InSupAFVCM3tK4F14fJAZXGnOY03JcZuLSlQ',
        'your-256-bit-secret',
        'sha256',
      );
      expect(result).toBe(true);
    });

    test('fail, payload is valid, but secretKey is not valid', () => {
      // secret key === your-256-bit-secre
      const result = sut.verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQifQ.ZgZi2yPw2vCILmbDXNsT8OjwvoypsSXqw78cdVQeRxs',
        'your-256-bit-secret',
        'sha256',
      );
      expect(result).toBe(false);
    });
  });
});
