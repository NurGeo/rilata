export type Constructor<T> = new (...args: any[]) => T;

export function makeInstance<T>(
  Ctor: Constructor<T>,
  ...args: ConstructorParameters<Constructor<T>>
): T {
  return new Ctor(...args);
}
