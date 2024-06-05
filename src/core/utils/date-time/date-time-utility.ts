import { Timestamp } from '../../types.js';

/* eslint-disable no-promise-executor-return */
export class DateTimeUtility {
  /**
   * Асинхронно ожидать некоторое время.
   * @param ms количество миллисекунд для ожидания;
   */
  static async asyncSleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Переводит переданную дату по времени в полночь
  // (0 часов, минут, секунд, миллисекунд).
  static dateToMidnight(timespamp: Timestamp): Timestamp {
    const date = new Date(timespamp);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
  }
}
