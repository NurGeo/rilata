/* eslint-disable camelcase */
import { describe, test, expect } from 'bun:test';
import { DateTimeUtility } from './date-time-utility.js';

describe('Тестирование DateTimeUtility', () => {
  describe('Метод dateToMidnight', () => {
    test('Перевод timestamp даты на полночь (0 часов, минут, секунд, миллисекунд)', () => {
      const mon_Jan_23_2023_7_15_14_GMT_0000 = 1674458114000;
      const mon_Jan_23_2023_0_00_00_GMT_0000 = 1674432000000;
      expect(DateTimeUtility.dateToMidnight(mon_Jan_23_2023_7_15_14_GMT_0000))
        .toBe(mon_Jan_23_2023_0_00_00_GMT_0000);
    });
  });
});
