/* eslint-disable no-console */
import { AssertionException } from '../exeptions.js';
import { BinaryKeyFlag } from '../utils/binary/binary-flag/binary-flag.js';
import { Logger } from './logger.js';
import { InputLoggerModes, loggerModes } from './logger-modes.js';

export class ConsoleLogger implements Logger {
  timeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hourCycle: 'h24',
  };

  protected modeDispatcher: BinaryKeyFlag<typeof loggerModes>;

  constructor(public logMode: InputLoggerModes) {
    this.modeDispatcher = new BinaryKeyFlag(loggerModes, logMode);
  }

  info(log: string): void {
    if (this.modeDispatcher.isAny(['info']) === false) return;
    this.toConsole(this.makeLogString('INFO', log));
  }

  warning(log: string, logAttrs?: unknown): void {
    if (this.modeDispatcher.isAny(['warn']) === false) return;
    this.toConsole(this.makeLogString('WARNING', log), logAttrs);
  }

  assert(condition: boolean, log: string, logAttrs?: unknown): void {
    if (condition) return;
    throw this.fatalError(log, logAttrs);
  }

  error(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    if (this.modeDispatcher.isAny(['error'])) {
      const errStack = err ? this.getErrStack(err) : {};
      this.toConsole(
        this.makeLogString('ERROR', log),
        { ...errStack, logAttrs },
      );
    }
    return new AssertionException(log);
  }

  fatalError(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    if (this.modeDispatcher.isAny(['fatal'])) {
      const errStack = err ? this.getErrStack(err) : {};
      this.toConsole(
        this.makeLogString('FATAL_ERROR', log),
        { ...errStack, logAttrs },
      );
    }
    return new AssertionException(log);
  }

  private makeLogString(type: string, log: string): string {
    const dateTime = new Date().toLocaleString(undefined, this.timeFormat);
    return `${type}-${dateTime}: ${log}`;
  }

  private getErrStack(err: Error): { stack: string[] } {
    return { stack: err.stack?.split('\n') ?? ['no stack'] };
  }

  private toConsole(text: string, logAttrs?: unknown): void {
    if (logAttrs === undefined) {
      console.log(text);
    } else {
      console.log('----- console log start -------');
      console.log(text);
      console.log(JSON.stringify(logAttrs, null, 2));
      console.log('----- console log end -------');
    }
  }
}
