/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DTO } from '../domain/dto.js';
import { UnionToTuple } from './tuple-types.js';

export type ContainsAll<T, U> = U extends T ? true : false;

export type GetArrayType<A extends Array<any> | ReadonlyArray<any>> =
  A extends Array<infer T> ? T :
  A extends ReadonlyArray<infer RT> ? RT : never;

export type FirstOfArray<A extends Array<any> | ReadonlyArray<any>> =
  A extends Array<any> ? (
    A extends [infer F, ...infer _] ? F : never
  ) : A extends readonly [infer F, ...infer _] ? F : never;

export type LastOfArray<A extends Array<any> | ReadonlyArray<any>> =
  A extends Array<any> ? (
    A extends [...infer _, infer L] ? L : never
  ) : A extends readonly [...infer _, infer L] ? L : never;

export type ShiftArray<A extends Array<any> | ReadonlyArray<any>> =
  A extends Array<any> ? (
    A extends [infer _, ...infer O] ? O : never
  ) : A extends readonly [infer _, ...infer O] ? O : never;

export type PopArray<A extends Array<any> | ReadonlyArray<any>> =
  A extends Array<any> ? (
    A extends [...infer O, ...infer _] ? O : never
  ) : A extends readonly [...infer O, ...infer _] ? O : never;

/** Возвращает ключи DTO как union или array.
  { a: string, b: number } => 'a' | 'b' | ['a', 'b'] */
export type ManyDtoKeys<D extends DTO> =
  keyof D & string
  | (keyof D & string)[]
  | ReadonlyArray<keyof D & string>;

export type ManyDtoKeysToUnion<T extends string | Array<string> | ReadonlyArray<string>> =
  T extends string ? T :
  T extends Array<string> ? GetArrayType<T> :
  T extends ReadonlyArray<string> ? GetArrayType<T> : never

/** извлекает из объекта ключи в точечной нотации
const a = {
  a?: {
    b?: {
      c: 'c',
    },
    d: [5],
  }
}
const b: GetDtoKeysByDotNotation<typeof a> //  'a | a.b | a.b.c' | 'a.d'
*/
export type GetDtoKeysByDotNotation<ObjectType extends DTO> =
{[Key in keyof ObjectType & string]: NonNullable<ObjectType[Key]> extends Array<infer T>
  ? T extends object
    ? `${Key}` | `${Key}.${GetDtoKeysByDotNotation<NonNullable<T>>}`
    : `${Key}`
  : NonNullable<ObjectType[Key]> extends object
    ? `${Key}` | `${Key}.${GetDtoKeysByDotNotation<NonNullable<ObjectType[Key]>>}`
    : `${Key}`
}[keyof ObjectType & string];

export type SplitStringToArray<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? string[] :
    S extends `${infer T}${D}${infer U}` ? [T, ...SplitStringToArray<U, D>] : [S];

export type GetDtoKeys<T extends DTO, K extends ManyDtoKeys<T>> =
  K extends keyof T
    ? K
    : K extends Array<keyof T>
      ? GetArrayType<K>
      : K extends ReadonlyArray<keyof T>
        ? GetArrayType<K>
        : never;

/** Возвращает DTO, где все значения являются unknown */
export type UnknownDto<
  OBJ extends DTO
> = {
    [K in keyof OBJ]?: OBJ[K] extends DTO
      ? UnknownDto<OBJ[K]>
      : unknown
};

/** Возвращает DTO, где типы первого заменены вторым */
export type ReplaceDtoAttrs<
  OBJ extends DTO,
  UPD extends UnknownDto<OBJ>
> = {
  [K in keyof OBJ]: K extends keyof UPD
    ? UPD[K] extends DTO
      ? OBJ[K] extends DTO
        ? ReplaceDtoAttrs<OBJ[K], UPD[K]>
        : UPD[K]
      : UPD[K]
    : OBJ[K]
};

/** Возвращает DTO с исключенными значениями */
export type ExcludeDtoAttrs<
  T extends DTO,
  K extends ManyDtoKeys<T>
> = Omit<T, GetDtoKeys<T, K>>;

/** Возвращает DTO, где типы первого расширены вторым */
export type ExtendDtoAttrs<
  T extends DTO,
  P extends DTO,
> = {
  [KEY in keyof T | keyof P]: KEY extends keyof P
    ? P[KEY]
    : KEY extends keyof T
      ? T[KEY]
      : never;
}

/** Возвращает DTO даже атрибуты вложенных объектов стали необязательными */
export type DeepPartial<T extends DTO> = {
  [KEY in keyof T]?: T[KEY] extends Record<string, any>
    ? DeepPartial<T[KEY]>
    : T[KEY]
}

/** Глубокое исключение атрибутов.
  ExcludeDeepAttrs<{a: {b: {c: string, f?: string}}, e: number}, ['a', 'b', 'c']>
*/
export type ExcludeDeepAttrs<TYPE, ATTRS extends unknown[]> =
  TYPE extends Array<infer ARR_TYPE>
    ? Array<ExcludeDeepAttrs<ARR_TYPE, ATTRS>>
    : TYPE extends DTO
      ? ATTRS extends [infer FIRST, ...infer OTHERS]
        ? FIRST extends keyof TYPE
          ? OTHERS extends []
            ? Omit<TYPE, FIRST>
            : ExcludeDeepAttrs<TYPE[FIRST], OTHERS> extends infer DEEP
              ? DEEP extends string
                ? Omit<TYPE, FIRST> // следующие ключи не валидные
                : Omit<TYPE, FIRST> & Record<FIRST, DEEP>
              : never
          : `${FIRST extends string ? FIRST : 'FIRST'} is not key of TYPE`
        : never
      : `${TYPE extends string ? TYPE : 'TYPE'} is literal`

/** Исключить из DTO | DTO[] атрибуты заданные в точечной нотации.
  Пример: ExcludeDeepAttrs<{a: {b: {c: string, f?: string}}, e: number}, ['a.b.c', 'e']>
*/
export type ExcludeDeepDotNotationAttrs<TYPE, DOT_NOTATION extends unknown[]> =
  DOT_NOTATION extends []
    ? TYPE
    : DOT_NOTATION extends [infer FIRST, ...infer OTHERS]
      ? ExcludeDeepAttrs<TYPE, SplitStringToArray<FIRST & string, '.'>> extends infer DEEPED
        ? OTHERS extends []
          ? DEEPED
          : ExcludeDeepDotNotationAttrs<DEEPED, OTHERS>
        : never
      : ExcludeDeepAttrs<TYPE, [DOT_NOTATION]>

export type GetDomainAttrsDotKeys<ATTRS extends DTO> =
  GetDtoKeysByDotNotation<ATTRS>
  | GetDtoKeysByDotNotation<ATTRS>[]
  | ReadonlyArray<GetDtoKeysByDotNotation<ATTRS>>

/** Исключить из DTO атрибуты заданные в точечной нотации.
  Пример:
    1. ExcludeDeepAttrs<{a: {b: {c: string, f?: string}}, e: number}, 'a.b.c'>
    2. ExcludeDeepAttrs<{a: {b: {c: string, f?: string}}, e: number}, ['a.b.c', 'e']>
*/
export type ExcludeDeepDtoAttrs<D extends DTO, DOT_NOTATION extends GetDomainAttrsDotKeys<D>> =
  DOT_NOTATION extends Array<any>
    ? ExcludeDeepDotNotationAttrs<D, DOT_NOTATION>
    : DOT_NOTATION extends ReadonlyArray<infer TUPLE_TYPE>
      ? ExcludeDeepDotNotationAttrs<D, UnionToTuple<TUPLE_TYPE>>
      : ExcludeDeepDotNotationAttrs<D, [DOT_NOTATION]>
