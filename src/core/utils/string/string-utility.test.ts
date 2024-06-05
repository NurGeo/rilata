import { describe, test, expect } from 'bun:test';
import { stringUtility } from './string-utility.js';

describe('Тестирование класса StringUtility', () => {
  const sut = stringUtility;

  test('Метод trimChars', () => {
    expect(sut.trim('  text   ', '')).toBe('  text   ');
    expect(sut.trim('text', 'sf')).toBe('text');
    expect(sut.trim('  text   ', ' ')).toBe('text');
    expect(sut.trim('  text,   ', ' ,')).toBe('text');
    expect(sut.trim('  ,text   ', ' ,')).toBe('text');
    expect(sut.trim('! ! ,text   ', ' ,!')).toBe('text');
    expect(sut.trim('! ! ,text ! text   ', ' ,!')).toBe('text ! text');
    expect(sut.trim('text1', '1')).toBe('text');
    expect(sut.trim('text1', '2')).toBe('text1');
    expect(sut.trim('text', 'ext')).toBe('');
  });

  test('Метод makeFirstLetterUppercase', () => {
    expect(sut.makeFirstLetterUppercase('иван')).toBe('Иван');
    expect(sut.makeFirstLetterUppercase('Иван')).toBe('Иван');
    expect(sut.makeFirstLetterUppercase('ивАн')).toBe('ИвАн');
    expect(sut.makeFirstLetterUppercase('')).toBe('');
    expect(sut.makeFirstLetterUppercase('-а')).toBe('-а');
    expect(sut.makeFirstLetterUppercase('12')).toBe('12');
  });

  test('метод kebabToCamelCase', () => {
    expect(sut.kebabToCamelCase('some-text-line')).toBe('someTextLine');
    expect(sut.kebabToCamelCase('s-ome-text-line')).toBe('sOmeTextLine');
    expect(sut.kebabToCamelCase('some-text-line-')).toBe('someTextLine-');
    expect(sut.kebabToCamelCase('-some-text-line')).toBe('SomeTextLine');
    expect(sut.kebabToCamelCase('-some---text-line')).toBe('SomeTextLine');
    expect(sut.kebabToCamelCase('-s')).toBe('S');
    expect(sut.kebabToCamelCase('s-')).toBe('s-');
    expect(sut.kebabToCamelCase('-')).toBe('-');
    expect(sut.kebabToCamelCase('s')).toBe('s');
    expect(sut.kebabToCamelCase('')).toBe('');
  });

  test('метод kebabToSuperCamelCase', () => {
    expect(sut.kebabToSuperCamelCase('some-text-line')).toBe('SomeTextLine');
    expect(sut.kebabToSuperCamelCase('s-ome-text-line')).toBe('SOmeTextLine');
    expect(sut.kebabToSuperCamelCase('some-text-line-')).toBe('SomeTextLine-');
    expect(sut.kebabToSuperCamelCase('-some-text-line')).toBe('SomeTextLine');
    expect(sut.kebabToSuperCamelCase('-some---text-line')).toBe('SomeTextLine');
    expect(sut.kebabToSuperCamelCase('-s')).toBe('S');
    expect(sut.kebabToSuperCamelCase('s-')).toBe('S-');
    expect(sut.kebabToSuperCamelCase('-')).toBe('-');
    expect(sut.kebabToSuperCamelCase('s')).toBe('S');
    expect(sut.kebabToSuperCamelCase('')).toBe('');

    test('метод snakeToCamelCase', () => {
      expect(sut.snakeToCamelCase('some_text_line')).toBe('someTextLine');
      expect(sut.snakeToCamelCase('s_ome_text_line')).toBe('sOmeTextLine');
      expect(sut.snakeToCamelCase('some_text_line_')).toBe('someTextLine_');
      expect(sut.snakeToCamelCase('_some_text_line')).toBe('SomeTextLine');
      expect(sut.snakeToCamelCase('_some___text_line')).toBe('SomeTextLine');
      expect(sut.snakeToCamelCase('_s')).toBe('S');
      expect(sut.snakeToCamelCase('s_')).toBe('s_');
      expect(sut.snakeToCamelCase('_')).toBe('_');
      expect(sut.snakeToCamelCase('s')).toBe('s');
      expect(sut.snakeToCamelCase('')).toBe('');
    });

    test('метод snakeToSuperCamelCase', () => {
      expect(sut.snakeToSuperCamelCase('some_text_line')).toBe('SomeTextLine');
      expect(sut.snakeToSuperCamelCase('s_ome_text_line')).toBe('SOmeTextLine');
      expect(sut.snakeToSuperCamelCase('some_text_line_')).toBe('SomeTextLine_');
      expect(sut.snakeToSuperCamelCase('_some_text_line')).toBe('SomeTextLine');
      expect(sut.snakeToSuperCamelCase('_some___text_line')).toBe('SomeTextLine');
      expect(sut.snakeToSuperCamelCase('_s')).toBe('S');
      expect(sut.snakeToSuperCamelCase('s_')).toBe('S_');
      expect(sut.snakeToSuperCamelCase('_')).toBe('_');
      expect(sut.snakeToSuperCamelCase('s')).toBe('S');
      expect(sut.snakeToSuperCamelCase('')).toBe('');
    });
  });

  test('метод camelCaseToKebab', () => {
    expect(sut.camelCaseToKebab('someTextLine')).toBe('some-text-line');
    expect(sut.camelCaseToKebab('SomeTextLine')).toBe('Some-text-line');
    expect(sut.camelCaseToKebab('someTextLinE')).toBe('some-text-lin-e');
    expect(sut.camelCaseToKebab('sOmeTextLine')).toBe('s-ome-text-line');
    expect(sut.camelCaseToKebab('S')).toBe('S');
    expect(sut.camelCaseToKebab('s')).toBe('s');
    expect(sut.camelCaseToKebab('')).toBe('');
  });

  test('метод camelCaseToSuperKebab', () => {
    expect(sut.camelCaseToSuperKebab('someTextLine')).toBe('some-text-line');
    expect(sut.camelCaseToSuperKebab('SomeTextLine')).toBe('some-text-line');
    expect(sut.camelCaseToSuperKebab('someTextLinE')).toBe('some-text-lin-e');
    expect(sut.camelCaseToSuperKebab('sOmeTextLine')).toBe('s-ome-text-line');
    expect(sut.camelCaseToSuperKebab('SOmeTextLine')).toBe('s-ome-text-line');
    expect(sut.camelCaseToSuperKebab('S')).toBe('s');
    expect(sut.camelCaseToSuperKebab('s')).toBe('s');
    expect(sut.camelCaseToSuperKebab('')).toBe('');
  });

  test('метод camelCaseToSnake', () => {
    expect(sut.camelCaseToSnake('someTextLine')).toBe('some_text_line');
    expect(sut.camelCaseToSnake('SomeTextLine')).toBe('Some_text_line');
    expect(sut.camelCaseToSnake('someTextLinE')).toBe('some_text_lin_e');
    expect(sut.camelCaseToSnake('sOmeTextLine')).toBe('s_ome_text_line');
    expect(sut.camelCaseToSnake('SOmeTextLine')).toBe('S_ome_text_line');
    expect(sut.camelCaseToSnake('S')).toBe('S');
    expect(sut.camelCaseToSnake('s')).toBe('s');
    expect(sut.camelCaseToSnake('')).toBe('');
  });

  test('метод camelCaseToSuperSnake', () => {
    expect(sut.camelCaseToSuperSnake('someTextLine')).toBe('some_text_line');
    expect(sut.camelCaseToSuperSnake('SomeTextLine')).toBe('some_text_line');
    expect(sut.camelCaseToSuperSnake('someTextLinE')).toBe('some_text_lin_e');
    expect(sut.camelCaseToSuperSnake('sOmeTextLine')).toBe('s_ome_text_line');
    expect(sut.camelCaseToSuperSnake('SOmeTextLine')).toBe('s_ome_text_line');
    expect(sut.camelCaseToSuperSnake('S')).toBe('s');
    expect(sut.camelCaseToSuperSnake('SS')).toBe('s_s');
    expect(sut.camelCaseToSuperSnake('s')).toBe('s');
    expect(sut.camelCaseToSuperSnake('')).toBe('');
  });

  describe('reduce method test', () => {
    const cbStr = (f: string, s: string): string => f + s + s;
    const cbNum = (f: number, s: string): number => f + Number(s) + Number(s);

    test('метод reduce emptytext: cb<str: str>', () => {
      expect(sut.reduce('', cbStr)).toBe('');
      expect(sut.reduce('', cbStr, '2')).toBe('2');
    });

    test('метод reduce text: cb<str: str>', () => {
      expect(sut.reduce('text', cbStr)).toBe('teexxtt');
      expect(sut.reduce('text', cbStr, '')).toBe('tteexxtt');
      expect(sut.reduce('text', cbStr, '!')).toBe('!tteexxtt');
    });

    test('метод reduce emptytext: cb<num: str>', () => {
      expect(sut.reduce('25', cbNum, 0)).toBe(14);
      expect(sut.reduce('25', cbNum, 2)).toBe(16);
    });
  });
});
