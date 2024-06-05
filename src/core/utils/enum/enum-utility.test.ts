import { describe, test, expect } from 'bun:test';
import { eNumUtility } from './enum-utility.js';

describe('Test eNumUtility', () => {
  enum strEnum {
    first = '1',
    second = '2',
    third = '3',
  }

  enum numEnum {
    first,
    second,
    third,
    fourth,
  }

  test('Тестирование getStringEnumKeys.', () => {
    const validKeys = ['first', 'second', 'third'];
    const testKeys = eNumUtility.getStringEnumKeys(strEnum);
    expect(testKeys).toEqual(validKeys);
  });

  test('Тестирование getNumberEnumKeys', () => {
    const validKeys = ['first', 'second', 'third', 'fourth'];
    const testKeys = eNumUtility.getNumberEnumKeys(numEnum);
    expect(testKeys).toEqual(validKeys);
  });

  test('Тестирование getStringEnumValues.', () => {
    const validKeys = ['1', '2', '3'];
    const testKeys = eNumUtility.getStringEnumValues(strEnum);
    expect(testKeys).toEqual(validKeys);
  });

  test('Тестирование getNumberEnumValues.', () => {
    const validKeys = [0, 1, 2, 3];
    const testKeys = eNumUtility.getNumberEnumValues(numEnum);
    expect(testKeys).toEqual(validKeys);
  });

  test('Тестирование getKeyByValueStringEnum.', () => {
    const result = eNumUtility.getKeyByValueOfStringEnum(strEnum, '2');
    expect(result).toEqual('second');
  });

  test('Тестирование getKeyByValueOfNumberEnum.', () => {
    const result = eNumUtility.getKeyByValueOfNumberEnum(numEnum, 3);
    expect(result).toEqual('fourth');
  });

  test('Тестирование getKeyByValueStringEnum. Исключение что такого значения нет.', () => {
    const func = (): void => {
      eNumUtility.getKeyByValueOfNumberEnum(strEnum, 8);
    };
    expect(func).toThrow();
  });
});
