import { Update } from '@grammyjs/types';
import { GeneralBotModuleResolves } from '#api/module/bot-types.js';
import { ModuleResolver } from '#api/module/m-resolver.js';
import { GeneralServerResolver } from '#api/server/types.js';
import { ModuleController } from './m-controller.js';
import { BotModule } from '#api/module/bot.module.js';
import { TelegramApi } from '#core/utils/telegram-api/telegram-api.js';

export class BotModuleController extends ModuleController {
  protected telegramApi: TelegramApi;

  constructor(botToken: string) {
    super();
    this.telegramApi = new TelegramApi(botToken);
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

    await this.telegramApi.postRequest(payload);
  }
}
