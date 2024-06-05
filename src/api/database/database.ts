import { GeneralModuleResolver } from '../module/types.js';

export interface Database {
  init(moduleResolver: GeneralModuleResolver, ...args: unknown[]): void

  stop(): void
}
