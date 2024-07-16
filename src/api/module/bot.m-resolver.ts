import { ServerResolver } from '#api/server/s-resolver.js';
import { ServerResolves } from '#api/server/s-resolves.js';
import { DTO } from '#domain/dto.js';
import { BotModuleResolves } from './bot.m-resolves.ts';
import { BotModule } from './bot.module.ts';
import { ModuleResolver } from './m-resolver.ts';

export abstract class BotModuleResolver<
  S_RES extends ServerResolver<ServerResolves<DTO>>, MR extends BotModuleResolves<BotModule>,
> extends ModuleResolver<S_RES, MR> {
  getBotToken(): string {
    return this.resolves.botToken;
  }
}
