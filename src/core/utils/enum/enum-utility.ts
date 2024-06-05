/* eslint-disable no-restricted-syntax */
import { AssertionException } from '../../exeptions.js';

export type NumberEnum = Record<string | number, string | number>
export type StringEnum = Record<string, string>

function getKeyByValue(
  eNum: StringEnum | NumberEnum,
  value: string | number,
  keys: string[],
): string {
  for (const key of keys) {
    const eNumValue = eNum[key];
    if (value === eNumValue) {
      return key;
    }
  }
  throw new AssertionException(`Значение ${value} не найдено в ${keys}.`);
}

/** Утилита для работы с перечислениями.
 * Разработана, так как необходима различная реализация алгоритмов
 * итерации ключей и значений для перечислении со
 * строковыми и числовыми значениями
 */
export class eNumUtility {
  /** Возвращает массив ключей для строковых перечислений */
  static getStringEnumKeys(eNum: StringEnum): string[] {
    return Object.keys(eNum);
  }

  /** Возвращает массив ключей для числовых перечислений */
  static getNumberEnumKeys(eNum: NumberEnum): string[] {
    const enumNames = [];
    for (const key in eNum) {
      if (isNaN(Number(key))) {
        enumNames.push(key);
      }
    }
    return enumNames;
  }

  /** Возвращает массив значений для строковых перечислений */
  static getStringEnumValues(eNum: StringEnum): string[] {
    const enumValues: string[] = [];
    for (const key of eNumUtility.getStringEnumKeys(eNum)) {
      enumValues.push(eNum[key]);
    }
    return enumValues;
  }

  /** Возвращает массив значений для числовых перечислений */
  static getNumberEnumValues(eNum: NumberEnum): number[] {
    const enumValues: number[] = [];
    for (const key of eNumUtility.getNumberEnumKeys(eNum)) {
      enumValues.push(eNum[key] as number);
    }
    return enumValues;
  }

  /** Возвращает ключ по переданному значению для строковых перечислений
         * @throws {Error} - Если в перечислении не будет такого значения,
         *      то будет выброшено исключение.
        */
  static getKeyByValueOfStringEnum(eNum: StringEnum, value: string): string {
    return getKeyByValue(eNum, value, this.getStringEnumKeys(eNum));
  }

  /** Возвращает ключ по переданному значению для числовых перечислений
         * @throws {Error} - Если в перечислении не будет такого значения,
         *      то будет выброшено исключение.
        */
  static getKeyByValueOfNumberEnum(eNum: NumberEnum, value: number): string {
    return getKeyByValue(eNum, value, this.getNumberEnumKeys(eNum));
  }
}
