/* eslint-disable no-underscore-dangle */
import { Update } from '@grammyjs/types';
import { BotState } from './state.js';
import { ApiMethodNames, ApiMethodsParams, BotReplyMessage, DialogueContext, GeneralBotMiddleware, SendMessage } from './types.js';
import { BotDialogueRepository } from './dialogue-repo.js';
import { updateUtils } from './utils/update.ts';
import { Constructor } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { Service } from '#api/service/service.js';
import { GeneralModuleResolver } from '#api/module/types.js';
import { BotModuleController } from '#api/controller/bot.m-controller.js';

export abstract class BotDialogueService extends Service<GeneralModuleResolver> {
  protected abstract stateCtors: Constructor<BotState>[];

  protected abstract middlewareCtors: Constructor<GeneralBotMiddleware>[];

  protected states!: BotState[];

  protected middlewares!: GeneralBotMiddleware[];

  init(resolver: GeneralModuleResolver): void {
    super.init(resolver);
    this.states = this.stateCtors.map((Ctor) => new Ctor());
    this.states.forEach((state) => state.init(this.moduleResolver, this));
    this.middlewares = this.middlewareCtors.map((Ctor) => new Ctor());
    this.middlewares.forEach((m) => m.init(this.moduleResolver, this));
  }

  async execute(update: Update): Promise<BotReplyMessage> {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const middleware of this.middlewares) {
        // eslint-disable-next-line no-await-in-loop
        const result = await middleware.process(update);
        if (result) return result;
      }

      const telegramId = updateUtils.getChatId(update);
      const context = this.findContext(telegramId);
      const stateName = context ? context.stateName : 'initialState';

      return this.getState(stateName).execute(update);
    } catch (e) {
      return this.processCatch(update, e as Error);
    }
  }

  async sendByBot(promise: Promise<ApiMethodsParams<ApiMethodNames>>): Promise<Response> {
    const params = await promise;
    const controller = this.moduleResolver.getModule().getModuleController() as BotModuleController;
    return controller.postRequest(params);
  }

  getState<S extends BotState>(stateName: S['stateName']): S {
    const state = this.states.find((s) => s.stateName === stateName);
    if (!state) {
      throw this.moduleResolver.getLogger().error(`not finded state by name: ${stateName}`);
    }
    return state as S;
  }

  findContext<C extends DialogueContext<DTO, string>>(telegramId: string): C | undefined {
    const dialogueRepo = BotDialogueRepository.instance<
      false, DialogueContext<DTO, string>
    >(this.moduleResolver);
    return dialogueRepo.findActive(telegramId) as C;
  }

  protected processCatch(update: Update, err: Error): BotReplyMessage {
    const chatId = updateUtils.getChatId(update);
    const context = this.findContext(chatId);
    this.moduleResolver.getLogger().error(
      err.message, { update, context }, err,
    );
    const msg: SendMessage = {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'К сожалению произошла непредвиденная ошибка. Попробуйте еще раз. Если ошибка будет повторяться, то рекомендуем завершить текущий диалог через команду /cancel и начать тест заново.',
    };
    return msg;
  }
}
