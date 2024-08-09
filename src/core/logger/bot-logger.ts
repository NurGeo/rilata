import { getLogger } from '#core/store/get-logger.js';
import { TelegramApi } from '#core/utils/telegram-api/telegram-api.js';
import { BotLoggerConfig } from '#core/utils/telegram-api/types.js';
import { BaseLogger } from './base-logger.ts';
import { LoggerModes } from './logger-modes.ts';

const blockCode = '```';

export class BotLogger extends BaseLogger {
  protected telegramApi: TelegramApi;

  constructor(logMode: LoggerModes, protected config: BotLoggerConfig) {
    super(logMode);
    this.telegramApi = new TelegramApi(config.token);
  }

  protected toLog(text: string, logAttrs?: unknown): void {
    this.sendToBot(text);
    if (logAttrs === undefined) {
      this.sendToBot(`${blockCode}\n${JSON.stringify(logAttrs, null, 2)}\n${blockCode}`);
    }
  }

  protected sendToBot(text: string): void {
    this.config.managerIds.forEach((managerId) => {
      this.telegramApi.postRequest({
        method: 'sendMessage',
        text,
        chat_id: managerId,
      });
    });
  }

  checkInvariants(): void {
    if (this.config.managerIds.length === 0) {
      throw getLogger().error('not setted manager ids for bot logger', { config: this.config });
    }
  }
}
