import { domainStore } from '#core/store/domain-store.js';
import { dtoUtility } from '../dto/dto-utility.ts';
import { ApiMethodNames, ApiMethodsParams } from './types.ts';

export class TelegramApi {
  static TELEGRAM_API = 'https://api.telegram.org/';

  constructor(protected botToken: string) {}

  async postRequest(reply: ApiMethodsParams<ApiMethodNames>): Promise<Response> {
    const store = domainStore.getPayload();
    if (store.runMode === 'test') {
      throw store.logger.error(
        'Произведен попытка отправки сообщения в телеграм сервер во время теста.',
        { reply },
      );
    }
    const data = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dtoUtility.excludeAttrs(reply, 'method')),
    };
    const repsonse = await fetch(`${this.getBotUrl()}/${reply.method}`, data);
    if (!repsonse.ok) {
      this.logFailFetch(data, repsonse);
    }
    return repsonse;
  }

  getBotUrl(): string {
    return `${TelegramApi.TELEGRAM_API}bot${this.botToken}`;
  }

  protected async logFailFetch(data: Record<string, unknown>, response: Response): Promise<void> {
    const resp = {
      ok: response.ok,
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: JSON.stringify([...Object.entries(response.headers)]),
      redirected: response.redirected,
      bodyUsed: response.bodyUsed,
      body: await response.text(),
    };
    domainStore.getPayload().logger.error('Ошибка при отправке данных в телеграм сервер', {
      fetchData: data, response: resp,
    });
  }
}
