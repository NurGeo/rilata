import { Update } from '@grammyjs/types';
import { GeneralModuleResolver } from '#api/module/types.js';
import { MaybePromise } from '#core/types.js';
import { BotDialogueService } from './dialogue-service.ts';
import { BotReplyMessage } from '#core/utils/telegram-api/types.js';

export abstract class BotState {
  abstract stateName: string;

  protected resolver!: GeneralModuleResolver;

  protected service!: BotDialogueService;

  // eslint-disable-next-line max-len
  init(resolver: GeneralModuleResolver, service: BotDialogueService): void {
    this.resolver = resolver;
    this.service = service;
  }

  abstract execute(update: Update): MaybePromise<BotReplyMessage>
}
