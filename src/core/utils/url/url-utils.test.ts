import { describe, expect, test } from 'bun:test';
import { urlUtils } from './url-utils.js';

describe('encode to base64Url and decode from base64Url cases', () => {
  const sut = urlUtils;
  test('success, less 127 bit string case', () => {
    expect(sut.encodeToBase64Url('your-256-bit-secret')).toBe('eW91ci0yNTYtYml0LXNlY3JldA');
    expect(sut.decodeFromBase64Url('eW91ci0yNTYtYml0LXNlY3JldA')).toBe('your-256-bit-secret');
  });

  test('success, utf string case', () => {
    expect(sut.encodeToBase64Url('a Ā 𐀀 文 🦄')).toBe('YSDEgCDwkICAIOaWhyDwn6aE');
    expect(sut.decodeFromBase64Url('YSDEgCDwkICAIOaWhyDwn6aE')).toBe('a Ā 𐀀 文 🦄');
  });

  test('success, number case', () => {
    expect(sut.encodeToBase64Url(555)).toBe('NTU1');
    expect(sut.decodeFromBase64Url('NTU1')).toBe(555);
  });

  test('success, undefined case', () => {
    expect(sut.encodeToBase64Url(null)).toBe('bnVsbA');
    expect(sut.decodeFromBase64Url('bnVsbA')).toBe(null);
  });

  test('success, dto case', () => {
    expect(sut.encodeToBase64Url({ userId: '5' })).toBe('eyJ1c2VySWQiOiI1In0');
    expect(sut.decodeFromBase64Url('eyJ1c2VySWQiOiI1In0')).toEqual({ userId: '5' });
  });

  test('success, array case', () => {
    expect(sut.encodeToBase64Url([1, 2, '3', null])).toBe('WzEsMiwiMyIsbnVsbF0');
    expect(sut.decodeFromBase64Url('WzEsMiwiMyIsbnVsbF0')).toEqual([1, 2, '3', null]);
  });
});
