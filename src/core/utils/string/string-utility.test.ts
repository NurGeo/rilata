import { describe, test, expect } from 'bun:test';
import { stringUtility } from './string-utility.js';

describe('Тестирование класса StringUtility', () => {
  const sut = stringUtility;

  describe('random method tests', () => {
    test('should generate string matching the format hh-hhhh-hhhh', () => {
      const result = sut.random('hh-hhhh-hhhh');
      const regex = /^[0-9a-f]{2}-[0-9a-f]{4}-[0-9a-f]{4}$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format dd.dddd.dddd with custom delimiter', () => {
      const result = sut.random('dd.dddd.dddd', '.');
      const regex = /^[0-9]{2}\.[0-9]{4}\.[0-9]{4}$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format 3-34-4h-hhh', () => {
      const result = sut.random('3-34-4h-hhh');
      const regex = /^[0-3]-[0-3][0-4]-[0-4][0-9a-f]-[0-9a-f]{3}$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format with custom delimiter and alphabet and digits', () => {
      const result = sut.random('zzzz#ddd', '#');
      const regex = /^[a-z]{4}#[0-9]{3}$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format with custom delimiter and digits', () => {
      const result = sut.random('2.2.4', '.');
      const regex = /^[0-2]\.[0-2]\.[0-4]$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format AA-zz-04', () => {
      const result = sut.random('AA-zz-04');
      const regex = /^[a-zA-Z0-9]{2}-[a-z]{2}-0[0-4]$/;
      expect(result).toMatch(regex);
    });

    test('should generate string matching the format ZZ-a', () => {
      const result = sut.random('ZZ-a');
      const regex = /^[a-zA-Z]{2}-[a-z0-9]$/;
      expect(result).toMatch(regex);
    });

    test('should generate a valid IP address format', () => {
      const result = sut.random('255.255.255.255', '.'); // может сгенерировать секцию 000
      const regex = /^([0-2]?[0-5]?[0-5]\.){3}[0-2]?[0-5]?[0-5]$/;
      expect(result).toMatch(regex);
    });
  });

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

  describe('replaceTemplate tests', () => {
    test('should replace template with default brackets and bracketCount', () => {
      const result = sut.replaceTemplate('Hello {{ template }} world!', 'template', 'TypeScript');
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should replace template with custom brackets and bracketCount', () => {
      const result = sut.replaceTemplate('Hello [[ template ]] world!', 'template', 'TypeScript', ['[', ']'], 2);
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should handle templates with leading and trailing spaces', () => {
      const result = sut.replaceTemplate('Hello {{  template  }} world!', 'template', 'TypeScript');
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should replace multiple instances of the template', () => {
      const result = sut.replaceTemplate('Hello {{ template }} world! {{ template }} again!', 'template', 'TypeScript');
      expect(result).toBe('Hello TypeScript world! TypeScript again!');
    });

    test('should handle templates with special characters', () => {
      const result = sut.replaceTemplate('Hello {{ template$ }} world!', 'template$', 'TypeScript');
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should not replace if template is not found', () => {
      const result = sut.replaceTemplate('Hello {{ not_found }} world!', 'template', 'TypeScript');
      expect(result).toBe('Hello {{ not_found }} world!');
    });

    test('should work with different bracket counts', () => {
      const result = sut.replaceTemplate('Hello {{{{ template }}}} world!', 'template', 'TypeScript', ['{', '}'], 4);
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should replace template with pre-installed brackets', () => {
      const result = sut.replaceTemplate('Hello *template* world!', 'template', 'TypeScript', ['*', '*'], 1);
      expect(result).toBe('Hello TypeScript world!');
    });

    test('should replace template with custom brackets set from pre-installed', () => {
      const result = sut.replaceTemplate('Hello < template > world!', 'template', 'TypeScript', ['<', '>'], 1);
      expect(result).toBe('Hello TypeScript world!');
    });
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
