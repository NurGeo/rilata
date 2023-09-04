export interface Logger {
  /** Различная информация о работе приложения */
  info(log: string): Promise<void>

  /** Не критичные предупреждения */
  wrong(log: string): Promise<void>

  /** Утверждения, если условие ложно, то запишется fatalError */
  assert(condition: boolean, log: string, logAttrs?: unknown): Promise<void>

  /** Ошибки программы которые выявляются в ходе проверок в коде */
  error(log: string, logAttrs?: unknown): never

  /** Фатальные ошибки, которые ловятся обработчиком на верхнем уровне */
  fatalError(log: string, logAttrs?: unknown): Promise<void>
}
