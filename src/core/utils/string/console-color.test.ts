import { describe, test, expect } from 'bun:test';
import { consoleColor } from './console-color.ts';

describe('ConsoleColor', () => {
  test('should return bright text', () => {
    const text = 'This is bright text';
    const result = consoleColor.bright(text);
    expect(result).toBe(`\x1b[1m${text}\x1b[0m`);
  });

  test('should return dim text', () => {
    const text = 'This is dim text';
    const result = consoleColor.dim(text);
    expect(result).toBe(`\x1b[2m${text}\x1b[0m`);
  });

  test('should return underscored text', () => {
    const text = 'This is underscored text';
    const result = consoleColor.underscore(text);
    expect(result).toBe(`\x1b[4m${text}\x1b[0m`);
  });

  test('should return blinking text', () => {
    const text = 'This is blinking text';
    const result = consoleColor.blink(text);
    expect(result).toBe(`\x1b[5m${text}\x1b[0m`);
  });

  test('should return reversed text', () => {
    const text = 'This is reversed text';
    const result = consoleColor.reverse(text);
    expect(result).toBe(`\x1b[7m${text}\x1b[0m`);
  });

  test('should return hidden text', () => {
    const text = 'This is hidden text';
    const result = consoleColor.hidden(text);
    expect(result).toBe(`\x1b[8m${text}\x1b[0m`);
  });

  test('should return red foreground text', () => {
    const text = 'This is red text';
    const result = consoleColor.fgColor(text, 'Red');
    expect(result).toBe(`\x1b[31m${text}\x1b[0m`);
  });

  test('should return green foreground text', () => {
    const text = 'This is green text';
    const result = consoleColor.fgColor(text, 'Green');
    expect(result).toBe(`\x1b[32m${text}\x1b[0m`);
  });

  test('should return blue foreground text', () => {
    const text = 'This is blue text';
    const result = consoleColor.fgColor(text, 'Blue');
    expect(result).toBe(`\x1b[34m${text}\x1b[0m`);
  });

  test('should return text with red background', () => {
    const text = 'This text has a red background';
    const result = consoleColor.bgColor(text, 'Red');
    expect(result).toBe(`\x1b[41m${text}\x1b[0m`);
  });

  test.skip('test print', () => {
    consoleColor.test();
    const cc = consoleColor;
    // eslint-disable-next-line no-console
    console.log(cc.bright(`\nThis is ${cc.blink(cc.fgColor('complex text', 'Red'))}`));
  });
});
