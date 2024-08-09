import { ApiMethods } from '@grammyjs/types';

export type ApiMethodNames = keyof ApiMethods<unknown>;

export type ApiMethodsParams<K extends ApiMethodNames> =
  Parameters<ApiMethods<unknown>[K]>[0] & { method: K };

export type SendMessage = ApiMethodsParams<'sendMessage'>;

export type NotResponse = {
  method: 'notResponse',
}

export type EditMessage = ApiMethodsParams<'editMessageText'>;

export type BotReplyMessage = NotResponse
  | SendMessage
  | EditMessage;

export type BotLoggerConfig = {
  token: string,
  managerIds: string[],
}
