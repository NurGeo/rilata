/* eslint-disable @typescript-eslint/no-explicit-any */
export type LiteralType = string | number | boolean | bigint;
export type LiteralWithUndefined = LiteralType | undefined;

export type LiteralRecord = Record<string, LiteralType>;
export type LiteralRecordWithUndefined = Record<string, LiteralWithUndefined>;

/** Плоский объект, без вложенного объекта */
export type FlatAttrs = Record<
  string,
  LiteralType | LiteralType[]
>;

export type AttrName = string;

export type IdType = string;

export type UuidType = string;

export type Timestamp = number;

export type UserId = UuidType;

/** Имя атрибута через точечную нотацию */
export type DeepAttr = string;

export type MaybePromise<T> = T | Promise<T>;

export type Constructor<T> = new (...args: any[]) => T;

export type ConstructorReturnType<C extends Constructor<any>>
= C extends Constructor<infer R> ? R : never;
