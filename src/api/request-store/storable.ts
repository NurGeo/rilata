import { WebReqeustStorePayload } from './types.ts';

export interface Storagable {
  run<F, Fargs extends unknown[]>(
    store: WebReqeustStorePayload,
    fn: (...args: Fargs) => F, ...args: Fargs
  ): F,

  /** Возвращает RequestStorePayload. Название метода привязано к AsyncLocalStorage API. */
  getStore(): WebReqeustStorePayload | undefined;
}
