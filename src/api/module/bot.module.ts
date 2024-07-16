/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Update } from '@grammyjs/types';
import { BotModuleController } from '#api/controller/bot.m-controller.js';
import { GeneralServerResolver } from '#api/server/types.js';
import { BotSubscribeMode, GeneralBotModuleResolves, GetUpdatesMode } from './bot-types.ts';
import { ModuleResolver } from './m-resolver.ts';
import { Module } from './module.js';
import { ApiMethodsParams, BotReplyMessage, SendMessage } from '#api/bot/types.js';
import { TELEGRAM_API } from '#api/controller/constants.js';
import { updateUtils } from '#api/bot/utils/update.js';
import { BotDialogueService } from '#api/bot/dialogue-service.js';

type TelegramId = string;

type GetUpdatesData = {
  mode: 'activeMode' | 'passiveMode',
  timer: Timer,
  atLastUpdate: number,
  newUpdateId?: number,
}

export abstract class BotModule extends Module {
  protected abstract service: BotDialogueService;

  declare protected moduleController: BotModuleController;

  declare protected moduleResolver: ModuleResolver<GeneralServerResolver, GeneralBotModuleResolves>;

  protected updatesData_?: GetUpdatesData;

  protected get updatesData(): GetUpdatesData {
    if (!this.updatesData_) {
      throw this.logger.error('should not have been called without first being installed');
    }
    return this.updatesData_;
  }

  init(
    moduleResolver: ModuleResolver<GeneralServerResolver, GeneralBotModuleResolves>,
    serverResolver: GeneralServerResolver,
  ): void {
    const { botToken } = moduleResolver.getModuleResolves();
    this.moduleController = new BotModuleController(botToken);
    super.init(moduleResolver, serverResolver);
    this.subscribeToUpdates();
    this.service.init(moduleResolver);
  }

  getSubscribeMode(): BotSubscribeMode {
    return this.moduleResolver.getModuleResolves().botSubscribeMode;
  }

  getBotToken(): string {
    return this.moduleResolver.getModuleResolves().botToken;
  }

  getModuleController(): BotModuleController {
    return this.moduleController;
  }

  async executeService(update: Update): Promise<BotReplyMessage> {
    try {
      return this.service.execute(update);
    } catch (e) {
      this.logger.error(
        `Ошибка при обработке запроса телеграм. Err: ${(e as Error).message}`,
        { serviceName: this.moduleName, update },
        e as Error,
      );
      const msg: SendMessage = {
        method: 'sendMessage',
        chat_id: updateUtils.getChatId(update),
        parse_mode: 'Markdown',
        text: '**К сожалению произошла непредвиденная ошибка.**\nПопробуйте еще раз, но с большой вероятностью ошибка полностью на нашей стороне.\nМы занимаемся этой ошибкой, но просим помочь вас и переслать это сообщение лицу которое предоставило ссылку на этот бот.',
      };
      return msg;
    }
  }

  getServices(): BotDialogueService[] {
    return [this.service];
  }

  getService(): BotDialogueService {
    return this.service;
  }

  protected subscribeToUpdates(): void {
    if (this.getSubscribeMode().type === 'getUpdates') {
      this.unSubscribeFromWebhook().then(() => {
        this.subscribeGetUpdates();
        const { moduleName } = this.moduleResolver.getModuleResolves();
        const msg = `successfully subscribed for bot module: ${moduleName}. Current mode: getUpdates.`;
        this.logger.info(msg);
      });
    } else {
      this.subscribeToWebHook();
    }
  }

  stop(): void {
    if (this.updatesData?.timer) {
      clearInterval(this.updatesData.timer);
    } else {
      this.unSubscribeFromWebhook();
    }
  }

  protected async subscribeToWebHook(): Promise<void> {
    const host = this.moduleResolver.getServerResolver().getPublicUrl();
    const controller = this.getModuleController();
    const params: ApiMethodsParams<'setWebhook'> = {
      method: 'setWebhook',
      url: `${host}${controller.getUrls()[0]}`,
    };

    const response = await controller.postRequest(params);
    if (!response.ok) {
      const logger = this.moduleResolver.getLogger();
      throw logger.error('Failed to subscribe to telegram webhook');
    }
  }

  protected async unSubscribeFromWebhook(): Promise<void> {
    const subscribeMode = this.moduleResolver.getModuleResolves().botSubscribeMode;
    if (subscribeMode.type === 'getUpdates' && !subscribeMode.unsubscribeWebhook) return;

    const controller = this.getModuleController();
    const response = await controller.postRequest({ method: 'deleteWebhook' });
    if (!response.ok) {
      throw new Error('Failed to unsubscribe from webhook');
    }
    const resolves = this.moduleResolver.getModuleResolves();
    const msg = `successfully webhook unsubscribed for bot module: ${resolves.moduleName}`;
    this.moduleResolver.getLogger().info(msg);
  }

  protected subscribeGetUpdates(lastUpdate?: Update): void {
    const subscribe = (timeout: number): Timer => setTimeout(
      this.getAndProcessUpdates.bind(this),
      timeout,
    );

    const isFirstSubsribe = !this.updatesData_;
    if (isFirstSubsribe) {
      this.updatesData_ = {
        timer: subscribe(0),
        mode: 'activeMode',
        atLastUpdate: Date.now(),
      };
      return;
    }
    if (lastUpdate) {
      this.updatesData.newUpdateId = lastUpdate.update_id + 1;
      this.updatesData.atLastUpdate = Date.now();
    }
    const getUpdateMode = this.getSubscribeMode() as GetUpdatesMode;
    if (this.updatesData.mode === 'activeMode' && !lastUpdate) {
      const timeShift = Date.now() - this.updatesData.atLastUpdate;
      const needToPassive = timeShift > getUpdateMode.timeoutToPassive;
      if (needToPassive) {
        this.updatesData.mode = 'passiveMode';
      }
    } else if (this.updatesData.mode === 'passiveMode' && lastUpdate) {
      this.updatesData.mode = 'activeMode';
    }
    const timeout = this.updatesData.mode === 'activeMode'
      ? getUpdateMode.activeModeTimout
      : getUpdateMode.passiveModeTimeout;
    this.updatesData.timer = subscribe(timeout);
  }

  protected async getAndProcessUpdates(): Promise<void> {
    const updates = await this.getUpdates();
    if (updates.length > 0) {
      const updatesByUsers = this.getUpdatesByUsers(updates);
      await this.processUpdates(updatesByUsers);
      const lastUpdate = updates[updates.length - 1];
      this.subscribeGetUpdates(lastUpdate);
    } else this.subscribeGetUpdates();
  }

  protected async getUpdates(): Promise<Update[]> {
    const body: ApiMethodsParams<'getUpdates'> = {
      method: 'getUpdates',
      offset: this.updatesData.newUpdateId,
      allowed_updates: ['message', 'callback_query'],
    };
    try {
      const response = await this.moduleController.postRequest(body);
      if (response.ok) return (await response.json()).result as Update[];

      this.logger.error(
        `Запрос getUpdates на сервер telegram вернул ошибку. Status: ${response.status}: StatusText: ${response.statusText}.`,
        { response: await response.json() },
      );
      return [];
    } catch (e) {
      this.logger.error(
        `Не удалось выполнить запрос getUpdates на сервер telegram: ${(e as Error).message}`,
        { body, url: this.getBotUrl() },
        e as Error,
      );
      return [];
    }
  }

  protected async processUpdates(usersUpdates: Record<TelegramId, Update[]>): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const [telegramId, userUpdates] of Object.entries(usersUpdates)) {
      if (userUpdates.length > 1) {
        this.logger.warning(`Бот получил ${userUpdates.length} сообщений для пользователя ${telegramId}. Будет обработано только последнее сообщение (режим диалога).`);
      }
      const update = userUpdates[userUpdates.length - 1];
      // запускаем последовательно для уменьшения вероятности ошибко
      // eslint-disable-next-line no-await-in-loop
      await this.moduleController.executeUpdate(update);
    }
  }

  protected getUpdatesByUsers(updates: Update[]): Record<TelegramId, Update[]> {
    const result: Record<TelegramId, Update[]> = {};
    updates.forEach((update) => {
      const telegramId = updateUtils.getChatId(update);
      if (telegramId in result) result[telegramId].push(update);
      else result[telegramId] = [update];
    });
    return result;
  }

  getBotUrl(): string {
    return `${TELEGRAM_API}bot${this.getBotToken()}`;
  }
}
