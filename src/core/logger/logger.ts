import { InputLoggerModes } from './logger-modes.js';

export interface Logger {
  logMode: InputLoggerModes

  /** Различная информация о работе приложения */
  info(log: string): void

  /** Не критичные предупреждения */
  warning(log: string, logAttrs?: unknown): void

  /** Утверждения, если условие ложно, то запишется fatalError */
 assert(condition: boolean, log: string, logAttrs?: unknown): void

  /** Ошибки программы которые выявляются в ходе проверок в коде */
  error(log: string, logAttrs?: unknown, err?: Error): Error

  /** Фатальные ошибки, которые ловятся обработчиком на верхнем уровне */
  fatalError(log: string, logAttrs?: unknown, err?: Error): Error
}
