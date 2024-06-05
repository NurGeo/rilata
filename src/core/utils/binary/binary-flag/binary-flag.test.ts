import { describe, test, expect } from 'bun:test';
import { BinaryKeyFlag } from './binary-flag.js';

const loggerModes = {
  prod: 0b1, // 1
  dev: 0b10, // 2
  test: 0b100, // 4
  info: 0b1000, // 8
  warn: 0b10000, // 16
};

describe('binary flags tests', () => {
  describe('получение из числа бинарных ключей', () => {
    const sut = BinaryKeyFlag;
    test('тестирование случаев возвращающих пересекающееся значение', () => {
      expect(sut.getFlagKeys(loggerModes, 1)).toEqual(['prod']);
      expect(sut.getFlagKeys(loggerModes, 4)).toEqual(['test']);
      expect(sut.getFlagKeys(loggerModes, 11)).toEqual(['prod', 'dev', 'info']); // 1 + 2 + 8;
      expect(sut.getFlagKeys(loggerModes, 39)).toEqual(['prod', 'dev', 'test']); // 1 + 2 + 4 + 32;
    });

    test('тестирование случаев с непересекающимися значениями', () => {
      expect(sut.getFlagKeys(loggerModes, 32)).toEqual([]);
    });
  });

  describe('поиск любого ключа (any)', () => {
    test('успех, ключ находится', () => {
      const sut = new BinaryKeyFlag(loggerModes, ['dev', 'info', 'warn']);
      expect(sut.isAny(['dev'])).toBe(true);
      expect(sut.isAny(['info'])).toBe(true);
      expect(sut.isAny(['warn'])).toBe(true);
      expect(sut.isAny(['warn', 'dev'])).toBe(true);
      expect(sut.isAny(['test', 'prod', 'info'])).toBe(true);
      expect(sut.isAny(['test', 'info', 'prod'])).toBe(true);
      expect(sut.isAny(['dev', 'test'])).toBe(true); // dev founded ==> true
    });

    test('провал, ключ не находится', () => {
      const sut = new BinaryKeyFlag(loggerModes, ['dev', 'info', 'warn']);
      expect(sut.isAny(['test'])).toBe(false);
      expect(sut.isAny(['test', 'prod'])).toBe(false);
      expect(sut.isAny(['def' as 'dev'])).toBe(false);
    });

    test('binary flags tests, off mode', () => {
      const sut = new BinaryKeyFlag(loggerModes, 'off');
      expect(sut.isAny(['dev'])).toBe(false);
      expect(sut.isAny(['info'])).toBe(false);
      expect(sut.isAny(['warn'])).toBe(false);
      expect(sut.isAny(['warn', 'dev'])).toBe(false);
      expect(sut.isAny(['test', 'prod', 'info'])).toBe(false);
      expect(sut.isAny(['test', 'info', 'prod'])).toBe(false);
      expect(sut.isAny(['test'])).toBe(false);
      expect(sut.isAny(['test', 'prod'])).toBe(false);
    });

    test('binary flags tests, all mode', () => {
      const sut = new BinaryKeyFlag(loggerModes, 'all');
      expect(sut.isAny(['dev'])).toBe(true);
      expect(sut.isAny(['info'])).toBe(true);
      expect(sut.isAny(['warn'])).toBe(true);
      expect(sut.isAny(['warn', 'dev'])).toBe(true);
      expect(sut.isAny(['test', 'prod', 'info'])).toBe(true);
      expect(sut.isAny(['test', 'info', 'prod'])).toBe(true);
      expect(sut.isAny(['test'])).toBe(true);
      expect(sut.isAny(['test', 'prod'])).toBe(true);
    });
  });

  describe('поиск всех ключа (all)', () => {
    test('успех, ключ находится', () => {
      const sut = new BinaryKeyFlag(loggerModes, ['dev', 'info', 'warn']);
      expect(sut.isAll(['dev'])).toBe(true);
      expect(sut.isAll(['info'])).toBe(true);
      expect(sut.isAll(['warn'])).toBe(true);
      expect(sut.isAll(['warn', 'dev'])).toBe(true);
      expect(sut.isAll(['warn', 'info', 'dev'])).toBe(true);
    });

    test('провал, ключ не находится', () => {
      const sut = new BinaryKeyFlag(loggerModes, ['dev', 'info', 'warn']);
      expect(sut.isAll(['test'])).toBe(false);
      expect(sut.isAll(['test', 'prod'])).toBe(false);
      expect(sut.isAll(['def' as 'dev'])).toBe(false);
      expect(sut.isAll(['dev', 'warn', 'test'])).toBe(false); // test not found ==> false
    });

    test('binary flags tests, off mode', () => {
      const sut = new BinaryKeyFlag(loggerModes, 'off');
      expect(sut.isAll(['dev'])).toBe(false);
      expect(sut.isAll(['info'])).toBe(false);
      expect(sut.isAll(['warn'])).toBe(false);
      expect(sut.isAll(['warn', 'dev'])).toBe(false);
      expect(sut.isAll(['test', 'prod', 'info'])).toBe(false);
      expect(sut.isAll(['test', 'info', 'prod'])).toBe(false);
      expect(sut.isAll(['test'])).toBe(false);
      expect(sut.isAll(['test', 'prod'])).toBe(false);
    });

    test('binary flags tests, all mode', () => {
      const sut = new BinaryKeyFlag(loggerModes, 'all');
      expect(sut.isAll(['dev'])).toBe(true);
      expect(sut.isAll(['info'])).toBe(true);
      expect(sut.isAll(['warn'])).toBe(true);
      expect(sut.isAll(['warn', 'dev'])).toBe(true);
      expect(sut.isAll(['test', 'prod', 'info'])).toBe(true);
      expect(sut.isAll(['test', 'info', 'prod'])).toBe(true);
      expect(sut.isAll(['test'])).toBe(true);
      expect(sut.isAll(['test', 'prod'])).toBe(true);
    });
  });
});
