/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DTO } from '../../../domain/dto.js';
import { AssertionException } from '../../exeptions.js';
import {
  DeepPartial,
  ExcludeDeepDtoAttrs, ExcludeDtoAttrs, ExtendDtoAttrs,
  GetDomainAttrsDotKeys, UnknownDto, ManyDtoKeys, ReplaceDtoAttrs,
} from '../../type-functions.js';
import { DeepAttr } from '../../types.js';

class DtoUtility {
  /** Возвращает копию объекта T, с исключенными атрибутами K. */
  excludeAttrs<
    T extends DTO,
    K extends ManyDtoKeys<T>
  >(obj: T, excludeAttrs: K, copy = true): ExcludeDtoAttrs<T, K> {
    const returnObj = copy ? this.deepCopy(obj) : obj;
    const excludeAttrsArr = (
      Array.isArray(excludeAttrs) ? excludeAttrs : [excludeAttrs]
    ) as ReadonlyArray<keyof T>;

    Object.keys(obj).forEach((key) => {
      if (excludeAttrsArr.indexOf(key) >= 0) delete returnObj[key];
    });
    return returnObj;
  }

  /** Возвращает копию объекта , расширенный атрибутами с объекта P.
  * - Если P[key]=undefined, то значение [key] тоже станет undefined.
  * - Если типы T[key] и P[key] не одинаковы, то вернется объект с типом P[key] */
  extendAttrs<
    T extends DTO,
    P extends DTO,
  >(obj: T, newValues: P, copy = true): ExtendDtoAttrs<T, P> {
    const returnObj = copy ? this.deepCopy(obj) : obj;
    Object.keys(newValues).forEach((key) => {
      returnObj[key as keyof T] = newValues[key] as typeof obj[typeof key];
    });
    return returnObj as ExtendDtoAttrs<T, P>;
  }

  /** Возвращает объект T, со значениями с объекта P.
  * - Не использовать для изменений структуры данных.
  * - Не изменяет объекты внутри массива, такие случаи обрабатывать отдельно.
  * - Если P[key] имеет значение undefined, то значение остается старым.
  * - Если copy=true возвращается копия объекта, иначе тот же объект */
  replaceAttrs<
    T extends DTO,
    P extends DeepPartial<T>,
  >(obj: T, newValues: P, copy = true): T {
    const returnObj = copy ? this.deepCopy(obj) : obj;
    Object.entries(newValues).forEach(([key, value]) => {
      const keyIsValid = (key in obj) && (key in newValues);
      if (keyIsValid && value !== undefined) {
        if (this.isDto(obj[key]) && this.isDto(value)) {
          returnObj[key as keyof T] = this.replaceAttrs(obj[key], value, copy);
        } else {
          returnObj[key as keyof T] = value;
        }
      }
    });
    return returnObj;
  }

  /** Возвращает объект T, с измененными типом и значениями P.
  * - Все значения Т, перетираются значениями P с изменением типа.
  * - Не изменяет объекты внутри массива, такие случаи обрабатывать отдельно.
  * - Не использовать для изменений структуры данных.
  * - Если copy=true возвращается копия объекта, иначе тот же объект */
  hardReplaceAttrs<
    T extends DTO,
    P extends UnknownDto<T>,
  >(obj: T, newValues: P, copy = true): ReplaceDtoAttrs<T, P> {
    const returnObj: Record<string, unknown> = copy ? this.deepCopy(obj) : obj;
    Object.entries(newValues).forEach(([key, value]) => {
      if ((key in obj) && (key in newValues)) {
        if (this.isDto(obj[key]) && this.isDto(value)) {
          returnObj[key] = this.hardReplaceAttrs(obj[key], value, copy);
        } else {
          returnObj[key] = value;
        }
      }
    });
    return returnObj as ReplaceDtoAttrs<T, P>;
  }

  /**
   * Deep copy function for TypeScript.
   * @param T Generic type of target/copied value.
   * @param target Target value to be copied.
   * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
   * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
   */
  deepCopy<T extends DTO>(target: T): T {
    if (target === null) {
      return target;
    }
    if (target instanceof Date) {
      return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
      const cp = [] as any[];
      (target as any[]).forEach((v) => { cp.push(v); });
      return cp.map((n: any) => this.deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && Object.keys(target).length > 0) {
      const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
      Object.keys(cp).forEach((k) => {
        cp[k] = this.deepCopy<any>(cp[k]);
      });
      return cp as T;
    }
    return target;
  }

  /** Исключить атрибуты в DTO, включая вложенные.
  * @param {DTO} obj объект, копию которого мы хотим получить.
  * @param {Array<DeepAttr>} excludedAttrs массив атрибутов в точечной нотации.
  *   т.е: ['name', 'phone.number'] вернет копию объекта без
  *   атрибута 'name' в основном объекте и без атрибута 'number'
  *   во вложенном объекте 'phone'. */
  excludeDeepAttrsByKeys<
    ATTRS extends DTO,
    EXC extends GetDomainAttrsDotKeys<ATTRS>
  >(obj: ATTRS, excludedAttrs: EXC): ExcludeDeepDtoAttrs<ATTRS, EXC> {
    return this.excludeDeepAttrs(obj, excludedAttrs) as ExcludeDeepDtoAttrs<ATTRS, EXC>;
  }

  excludeDeepAttrs(obj: DTO, keys: string | string[] | ReadonlyArray<string>): DTO {
    const objCopy = this.deepCopy(obj);
    const attrs = (Array.isArray(keys) ? keys : [keys]) as string[];

    const deepDelete = (dto: DTO, attributePath: string): void => {
      const attributePathAsArray = attributePath.split('.');

      attributePathAsArray.forEach((levelAttr: string, idx: number): void => {
        if (idx !== attributePathAsArray.length - 1) {
          dto = dto[levelAttr];
        }
      });

      if (dto !== undefined) {
        delete dto[attributePathAsArray.pop() as string];
      }

      return undefined;
    };

    attrs.forEach((excludedAttr: string) => {
      deepDelete(objCopy, excludedAttr);
    });

    return objCopy;
  }

  /**
   * Объединяет два объекта.
   * В приоритете первый объект, только если значение его атрибута не undefined.
   * Иначе берется значение атрибута второго объекта.
   * @param object1
   * @param object2
  */
  mergeObjects<T extends {[key: string]: Exclude<any, null>}>(
    object1: Readonly<T>,
    object2: Readonly<T>,
  ): T {
    const res: T = { ...object1 };

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(object1).concat(Object.keys(object2))) {
      res[key as keyof T] = object1[key] !== undefined ? object1[key] : object2[key];
    }

    return res;
  }

  getValueByDeepAttr<T>(
    dto: DTO,
    key: DeepAttr,
    throwError = false,
  ): T | undefined {
    if (key.startsWith('.') || key.endsWith('.') || key === '') {
      throw new AssertionException(
        `Ключ ${key} не может начинаться или заканчиваться точкой и не может быть пустым`,
      );
    }
    const attributePathAsArray = key.split('.');
    let resultStorage = dto;

    try {
      attributePathAsArray.forEach((levelAttr: string, idx: number): void => {
        if (idx !== attributePathAsArray.length) {
          if (!(levelAttr in resultStorage)) throw new TypeError();
          resultStorage = resultStorage[levelAttr];
        }
      });
      return resultStorage as T;
    } catch (err) {
      if (err instanceof TypeError) {
        if (throwError) {
          throw new AssertionException(
            `В объекте ${JSON.stringify(dto)} отсутствует вложенный ключ ${key}.`,
          );
        }
        return undefined;
      }
      throw err;
    }
  }

  /** Возвращает массив уникальных ключей объектов */
  getUniqueKeys(objects: DTO[]): string[] {
    const set = new Set<string>();
    objects.forEach((obj) => Object.keys(obj).forEach((key) => set.add(key)));
    return Array.from(set);
  }

  /** Возвращает копию объекта с измененными ключами. Работает только для объекта первого уровня. */
  editKeys(object: DTO, cb: (key: string) => string): DTO {
    const result: DTO = {};
    Object.entries(object).forEach(([key, value]) => { result[cb(key)] = value; });
    return result;
  }

  /** Возвращает копию объекта с измененными значениями. Только для объекта первого уровня. */
  editValues<T>(object: DTO, cb: (value: unknown) => T): Record<string, T> {
    const result: Record<string, T> = {};
    Object.entries(object).forEach(([key, value]) => { result[key] = cb(value); });
    return result;
  }

  isDto(value: unknown): value is DTO {
    return value !== undefined
      && value !== null
      && value.constructor === Object;
  }
}

export const dtoUtility = new DtoUtility();
