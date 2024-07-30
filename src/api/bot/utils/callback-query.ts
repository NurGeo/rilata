/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CallbackQuery, Update } from '@grammyjs/types';

class CallbackQueryUtils {
  isCbQuery(cbQuery?: CallbackQuery): cbQuery is CallbackQuery {
    return cbQuery !== undefined;
  }

  isThisCbQuery(cbData: string | RegExp, update: Update): boolean {
    const cbQuery = update.callback_query;
    if (update.callback_query === undefined || cbQuery?.data === undefined) return false;
    return typeof cbData === 'string'
      ? cbQuery.data === cbData
      : cbData.test(cbQuery!.data);
  }
}

export const cbQueryUtils = new CallbackQueryUtils();
