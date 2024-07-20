import { BotModuleResolver } from '#api/module/bot.m-resolver.js';
import { BotModuleResolves } from '#api/module/bot.m-resolves.js';
import { BotModule } from '#api/module/bot.module.js';
import { GeneralServerResolver } from '#api/server/types.js';

export type GeneralBotModuleResolves = BotModuleResolves<BotModule>

export type GeneralBotModuleResolver = BotModuleResolver<
  GeneralServerResolver, GeneralBotModuleResolves
>

export type GetUpdatesMode = {
  type: 'getUpdates',
  unsubscribeWebhook: boolean,
  timeoutToPassive: number, // время между запросами getUpdates для режима passive
  activeModeTimout: number, // время между запросами getUpdates для режима active
  passiveModeTimeout: number, // время неактивности для перехода в passive
}

export type WebhookMode = {
  type: 'webhook',
}

export type OffMode = {
  type: 'off',
}

export type BotSubscribeMode = GetUpdatesMode | WebhookMode | OffMode
