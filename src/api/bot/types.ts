import { Timestamp } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { BotMiddleware } from './middleware.ts';

export type DialogueContext<R extends DTO, SN extends string> = {
  telegramId: string;
  isActive: boolean;
  stateName: SN;
  lastUpdate: Timestamp;
  payload: R;
}

export type GeneralBotMiddleware = BotMiddleware<DialogueContext<DTO, string>>

export type UpdateContextAttrs = Partial<Pick<DialogueContext<DTO, string>, 'stateName' | 'payload'>>

export type FinishContextAttrs = Partial<Pick<DialogueContext<DTO, string>, 'stateName' | 'payload'>>
