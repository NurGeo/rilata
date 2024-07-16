import { Update } from '@grammyjs/types';
import { BotReplyMessage, DialogueContext } from './types.ts';
import { MaybePromise } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { BotDialogueService } from './dialogue-service.ts';
import { GeneralModuleResolver } from '#api/module/types.js';

export abstract class BotMiddleware<C extends DialogueContext<DTO, string>> {
  protected resolver!: GeneralModuleResolver;

  protected router!: BotDialogueService;

  init(resolver: GeneralModuleResolver, router: BotDialogueService): void {
    this.resolver = resolver;
    this.router = router;
  }

  protected findContext(telegramId: string): C | undefined {
    return this.router.findContext(telegramId) as C;
  }

  abstract process(update: Update): MaybePromise<BotReplyMessage | undefined>
}
