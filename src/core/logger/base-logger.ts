import { AssertionException } from '#core/exeptions.js';
import { BinaryKeyFlag } from '#core/utils/binary/binary-flag/binary-flag.js';
import { LoggerModes, loggerModes } from './logger-modes.ts';
import { Logger } from './logger.ts';

export abstract class BaseLogger implements Logger {
  timeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hourCycle: 'h24',
  };

  protected modeDispatcher: BinaryKeyFlag<typeof loggerModes>;

  constructor(public logMode: LoggerModes) {
    this.modeDispatcher = new BinaryKeyFlag(loggerModes, logMode);
  }

  getLogMode(): LoggerModes {
    return this.logMode;
  }

  setLogMode(logMode: LoggerModes): void {
    this.logMode = logMode;
  }

  protected abstract toLog(text: string, logAttrs?: unknown): void

  info(log: string): void {
    if (this.modeDispatcher.isAny(['info']) === false) return;
    this.toLog(this.makeLogString('INFO', log));
  }

  warning(log: string, logAttrs?: unknown): void {
    if (this.modeDispatcher.isAny(['warn']) === false) return;
    this.toLog(this.makeLogString('WARNING', log), logAttrs);
  }

  assert(condition: boolean, log: string, logAttrs?: unknown): void {
    if (condition) return;
    throw this.fatalError(log, logAttrs);
  }

  error(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    if (this.modeDispatcher.isAny(['error'])) {
      this.toLog(
        this.makeLogString('ERROR', log),
        { error: this.getErr(err), logAttrs },
      );
    }
    return new AssertionException(log);
  }

  fatalError(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    if (this.modeDispatcher.isAny(['fatal'])) {
      this.toLog(
        this.makeLogString('FATAL_ERROR', log),
        { error: this.getErr(err), logAttrs },
      );
    }
    return new AssertionException(log);
  }

  protected makeLogString(type: string, log: string): string {
    const dateTime = new Date().toLocaleString(undefined, this.timeFormat);
    const suffix = `[${type}-${dateTime}]`.padEnd(26);
    return `${suffix}${log}`;
  }

  protected getErr(err?: Error): Record<string, unknown> {
    return err
      ? {
        ...err,
        stack: err.stack?.split('\n') ?? ['no stack'],
      }
      : {};
  }
}
