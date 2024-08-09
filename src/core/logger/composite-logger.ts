/* eslint-disable no-console */
import { AssertionException } from '../exeptions.js';
import { Logger } from './logger.js';
import { LoggerModes } from './logger-modes.js';

export class CompositeLogger implements Logger {
  constructor(protected loggers: Logger[]) {
    if (loggers.length === 0) throw Error('not found loggers in composit logger');
  }

  setLogMode(logMode: LoggerModes): void {
    this.loggers.forEach((logger) => logger.setLogMode(logMode));
  }

  getLogMode(): LoggerModes {
    return this.loggers[0].getLogMode();
  }

  getLoggers(): Logger[] {
    return this.loggers;
  }

  info(log: string): void {
    this.loggers.forEach((l) => l.info(log));
  }

  warning(log: string, logAttrs?: unknown): void {
    this.loggers.forEach((l) => l.warning(log, logAttrs));
  }

  assert(condition: boolean, log: string, logAttrs?: unknown): void {
    this.loggers.forEach((l) => l.assert(condition, log, logAttrs));
  }

  error(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    return this.loggers.map((l) => l.error(log, logAttrs, err))[0];
  }

  fatalError(log: string, logAttrs?: unknown, err?: Error): AssertionException {
    return this.loggers.map((l) => l.fatalError(log, logAttrs, err))[0];
  }
}
