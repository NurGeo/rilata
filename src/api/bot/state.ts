import { Update } from '@grammyjs/types';
import { BotReplyMessage } from './types.ts';
import { GeneralModuleResolver } from '#api/module/types.js';
import { BotDialogueService } from './dialogue-service.ts';

export abstract class BotState {
  abstract stateName: string;

  protected resolver!: GeneralModuleResolver;

  protected router!: BotDialogueService;

  // eslint-disable-next-line max-len
  init(resolver: GeneralModuleResolver, router: BotDialogueService): void {
    this.resolver = resolver;
    this.router = router;
  }

  abstract execute(update: Update): Promise<BotReplyMessage>
}
