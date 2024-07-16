import { Update } from '@grammyjs/types';
import { GeneralBotModuleResolves } from '#api/module/bot-types.js';
import { ModuleResolver } from '#api/module/m-resolver.js';
import { GeneralServerResolver } from '#api/server/types.js';
import { ModuleController } from './m-controller.js';
import { ApiMethodNames, ApiMethodsParams } from '#api/bot/types.js';
import { TELEGRAM_API } from './constants.ts';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { BotModule } from '#api/module/bot.module.js';

export class BotModuleController extends ModuleController {
  constructor(protected botToken: string) {
    super();
  }

  declare resolver: ModuleResolver<GeneralServerResolver, GeneralBotModuleResolves>;

  async execute(req: Request): Promise<void> {
    try {
      this.executeUpdate(await req.json() as Update);
    } catch (e) {
      this.resolver.getLogger().error('Ошибка сериализации данных json', {
        reqBlob: await req.blob(),
      });
    }
  }

  async executeUpdate(update: Update): Promise<void> {
    const module = this.resolver.getModule();
    const payload = await (module as BotModule).executeService(update);
    if (payload.method === 'notResponse') return;

    await this.postRequest(payload);
  }

  async postRequest(reply: ApiMethodsParams<ApiMethodNames>): Promise<Response> {
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
    return `${TELEGRAM_API}bot${this.botToken}`;
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
    this.resolver.getLogger().error('Ошибка при отпраке данных в телеграм сервер', {
      fetchData: data, response: resp,
    });
  }
}
