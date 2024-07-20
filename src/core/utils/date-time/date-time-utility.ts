import { Timestamp } from '../../types.js';

/* eslint-disable no-promise-executor-return */
class DateTimeUtility {
  /**
   * Асинхронно ожидать некоторое время.
   * @param ms количество миллисекунд для ожидания;
   */
  async sleep(ms: number): Promise<Timer | number> {
    return new Promise((resolve): Timer | number => setTimeout(resolve, ms));
  }

  // Переводит переданную дату по времени в полночь
  // (0 часов, минут, секунд, миллисекунд).
  dateToMidnight(timespamp: Timestamp): Timestamp {
    const date = new Date(timespamp);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
  }
}

export const dateTimeUtility = new DateTimeUtility();
