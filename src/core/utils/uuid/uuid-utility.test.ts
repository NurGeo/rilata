/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, test, expect } from 'bun:test';
import { AssertionException } from '../../exeptions.js';
import { uuidUtility } from './uuid-utility.js';

describe('uuidUtility class test', () => {
  const incorrectUUID = '0dd856f7-c085-4c1b-8805-15ef64';
  const correctUUID = '0dd856f7-c085-4c1b-8805-15ef6469c177';
  const uuid = uuidUtility.getNewUUID();
  test('test getNewUUIDValue method returned value', () => {
    expect(typeof uuid).toBe('string');
  });

  test('test isValidValue method, is valid case', () => {
    expect(uuidUtility.isValidValue(correctUUID)).toBe(true);
    expect(uuidUtility.isValidValue(uuid)).toBe(true);
  });

  test('test isValidValue method, not valid value case', () => {
    expect(uuidUtility.isValidValue(incorrectUUID)).toBe(false);
    expect(uuidUtility.isValidValue(undefined)).toBe(false);
  });

  test('test cleanValue, validValue case', () => {
    expect(uuidUtility.cleanValue(uuid)).toBe(uuid);
  });

  test('test cleanValue method, throw exception case', () => {
    const cb = () => uuidUtility.cleanValue(incorrectUUID);
    // eslint-disable-next-line quotes
    expect(cb).toThrow(new AssertionException(`Значение ${incorrectUUID} не является валидным для типа UUID v4`));
  });

  describe('UUID Conversion', () => {
    test('should convert UUID to bytes correctly', () => {
      const uuidStr = '550e8400-e29b-41d4-a716-446655440000';
      const expectedBytes = new Uint8Array(
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 0, 0],
      );

      const bytes = uuidUtility.toBytes(uuidStr);
      expect(bytes).toEqual(expectedBytes);
    });

    test('should convert bytes to UUID correctly', () => {
      const bytes = new Uint8Array(
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 0, 0],
      );
      const expectedUuid = '550e8400-e29b-41d4-a716-446655440000';

      const uuidStr = uuidUtility.fromBytes(bytes);
      expect(uuidStr).toBe(expectedUuid);
    });

    test('should convert UUID to bytes and back to UUID correctly', () => {
      const uuidStr = '550e8400-e29b-41d4-a716-446655440000';
      const bytes = uuidUtility.toBytes(uuidStr);
      const convertedUuid = uuidUtility.fromBytes(bytes);

      expect(convertedUuid).toBe(uuidStr);
    });

    test('should throw error for invalid byte array length', () => {
      const valuesRows: number[][] = [
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 0, 0, 0, 5],
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 0, 0, 0],
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 0],
        [85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68],
      ];
      valuesRows.forEach((values) => {
        const bytes = new Uint8Array(values);
        expect(() => uuidUtility.fromBytes(bytes)).toThrow(`Invalid byte array length for UUID: ${bytes.length}`);
      });
    });

    test('should throw error for invalid uuid value', () => {
      const valuesRows: string[] = [
        '550e8400-e29b-41d4-a716-4466554400001',
        '550e8400-e29b-41d4-a716-44665544000u',
        '550e8400-e29b-41d4-a716-44665544000',
        '550e8400-e29b-41d4-a716-4466554400',
      ];
      valuesRows.forEach((uuidStr) => {
        expect(() => uuidUtility.toBytes(uuidStr)).toThrow(`not valid uuid: ${uuidStr}`);
      });
    });
  });
});
