import { Update } from '@grammyjs/types';
import { DialogueContext } from './types.ts';
import { MaybePromise } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { BotDialogueService } from './dialogue-service.ts';
import { GeneralModuleResolver } from '#api/module/types.js';
import { BotReplyMessage } from '#core/utils/telegram-api/types.js';

export abstract class BotMiddleware<C extends DialogueContext<DTO, string>> {
  protected resolver!: GeneralModuleResolver;

  protected service!: BotDialogueService;

  init(resolver: GeneralModuleResolver, service: BotDialogueService): void {
    this.resolver = resolver;
    this.service = service;
  }

  protected findContext(telegramId: string): C | undefined {
    return this.service.findContext(telegramId) as C;
  }

  abstract process(update: Update): MaybePromise<BotReplyMessage | undefined>
}
