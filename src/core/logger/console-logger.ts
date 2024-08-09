/* eslint-disable no-console */
import { consoleColor } from '#core/utils/string/console-color.js';
import { BaseLogger } from './base-logger.ts';

export class ConsoleLogger extends BaseLogger {
  protected toLog(text: string, logAttrs?: unknown): void {
    if (logAttrs === undefined) {
      console.log(text);
    } else {
      console.log('----- console log start -------');
      console.log(text);
      console.log(JSON.stringify(logAttrs, null, 2));
      console.log('----- console log end -------');
    }
  }

  protected makeLogString(type: string, log: string): string {
    const dateTime = new Date().toLocaleString(undefined, this.timeFormat);
    const suffix = `[${type}-${dateTime}]`.padEnd(26);
    const color = type.includes('ERROR')
      ? 'Red'
      : type === 'INFO'
        ? 'Green'
        : 'Yellow';
    return `${consoleColor.fgColor(suffix, color)}${log}`;
  }
}
