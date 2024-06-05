import { describe, expect, test } from 'bun:test';
import { AssertionException } from '../../exeptions.js';
import { ReplaceDtoAttrs } from '../../type-functions.js';
import { dtoUtility } from './dto-utility.js';

const sut = dtoUtility;

describe('dtoUtility class', () => {
  describe('получение глубокой копии объекта', () => {
    const personDto = {
      name: 'nur',
      phone: ['first number', 'second number'],
      wife: {
        name: 'samal',
        phone: ['mobile number'],
      },
    };

    test('возращается точная копия объекта', () => {
      const copiedObj = sut.deepCopy(personDto);

      expect(copiedObj).toStrictEqual(personDto);
      expect(copiedObj).not.toBe(personDto);
    });
  });

  describe('изменение объекта новыми значениями', () => {
    const personDto = {
      name: 'Bill',
      phone: ['+ 7 777 7777'],
      age: 42,
      sex: 'man',
      car: {
        model: 'Camry',
        engine: {
          type: 'diesel',
          cylindersCount: 4,
        },
      },
    };

    test('изменения атрибутов первого уровня, получили копию объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 43, sex: '' };
      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).not.toBe(copiedPersonDto);
      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 43, // was 42
        sex: '', // was man
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('изменения атрибутов первого уровня, изменили оригинал объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 43, sex: '' };
      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues, false);

      expect(newPersonDto).toBe(copiedPersonDto);
      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 43, // was 42
        sex: '', // was man
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('изменение значения массива на первом уровне', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { phone: ['+ 7 777 0011'], age: 44 };
      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 0011'], // was +7 777 7777
        age: 44, // was 42
        sex: 'man',
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('дополнительные атрибуты не добавляются', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 45, sex: '', eyeColor: 'brown' };
      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 45, // was 42
        sex: '', // was man
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('переданный атрибут со значением undefined не копируется в возвращаемый объект', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 46, sex: undefined };

      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 46, // was 42
        sex: 'man', // not replaced
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('замена атрибутов вложенного уровня происходит нормально', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 47, car: { model: 'Ford' } };

      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 47, // was 42
        sex: 'man',
        car: {
          model: 'Ford', // was 'Camry'
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      });
    });

    test('замена атрибутов двух вложенных уровней происходит нормально', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 48, car: { model: 'Ford', engine: { type: 'gasoline' } } };

      const newPersonDto = sut.replaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).toEqual({
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 48, // was 42
        sex: 'man',
        car: {
          model: 'Ford', // was 'Camry'
          engine: {
            type: 'gasoline', // was 'diesel'
            cylindersCount: 4,
          },
        },
      });
    });

    test('замена атрибутов двух вложенных уровней происходит нормально', () => {
      const carOwner: Record<string, unknown> = {
        name: 'Bill',
        home: null,
        car: {
          model: 'Audi',
          engine: null,
        },
      };
      const newValues = {
        home: {
          address: 'World street, 56',
        },
        car: {
          engine: {
            type: 'electro',
          },
          mode: '4wd',
        },
      };
      const newCarOwner = sut.replaceAttrs(carOwner, newValues);

      expect(newCarOwner).toEqual({
        name: 'Bill',
        home: {
          address: 'World street, 56',
        },
        car: {
          model: 'Audi',
          engine: {
            type: 'electro',
          },
        },
      });
    });
  });

  describe('жесткое изменение объекта новыми значениями с изменением типа', () => {
    const personDto = {
      name: 'Bill',
      phone: ['+ 7 777 7777'],
      age: 42,
      sex: 'man',
      car: {
        model: 'Camry',
        engine: {
          type: 'diesel',
          cylindersCount: 4,
        },
      },
    };

    test('жесткое изменение атрибутов первого уровня, получили копию объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 43, sex: '' };
      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);

      expect(newPersonDto).not.toBe(copiedPersonDto);
      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newPersonDto> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 43,
        sex: '',
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };
      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткое изменение атрибутов первого уровня, изменили оригинал объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 43, sex: '' };
      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues, false);

      expect(newPersonDto).toBe(copiedPersonDto);
      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newPersonDto> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 43,
        sex: '',
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };
      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткое изменение значения массива и изменение типа на первом уровне', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { phone: [null], age: 'child' };
      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);

      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newValues> = {
        name: 'Bill',
        phone: [null], // was +7 777 7777
        age: 'child', // was 42
        sex: 'man',
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };
      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткое изменение, дополнительные атрибуты не добавляются', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 'child', sex: '', eyeColor: 'brown' };
      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);

      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newValues> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 'child', // was 42
        sex: '', // was man
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };
      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткое изменение атрибут со значением undefined тоже перезаписывает значение', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 46, sex: undefined };

      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);

      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newValues> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 46, // was 42
        sex: undefined, // replaced to undefined
        car: {
          model: 'Camry',
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };
      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткая замена атрибутов вложенного уровня происходит нормально', () => {
      const models = {
        Toyota: 1,
        BMW: 2,
        Audi: 3,
        Ford: 4,
      };
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 47, car: { model: models.Toyota } };

      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);
      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newValues> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 47, // was 42
        sex: 'man',
        car: {
          model: 1, // was 'Camry'
          engine: {
            type: 'diesel',
            cylindersCount: 4,
          },
        },
      };

      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесткая замена атрибутов двух вложенных уровней происходит нормально', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: 48, car: { model: 5, engine: { type: undefined } } };

      const newPersonDto = sut.hardReplaceAttrs(copiedPersonDto, newValues);
      const expectDto: ReplaceDtoAttrs<typeof copiedPersonDto, typeof newValues> = {
        name: 'Bill',
        phone: ['+ 7 777 7777'],
        age: 48, // was 42
        sex: 'man',
        car: {
          model: 5, // was 'Camry'
          engine: {
            type: undefined, // was 'diesel'
            cylindersCount: 4,
          },
        },
      };

      expect(newPersonDto).toEqual(expectDto);
    });

    test('жесктая замена атрибутов двух вложенных уровней происходит нормально', () => {
      const carOwner = {
        name: 'Bill',
        home: null,
        car: {
          model: 'Audi',
          engine: null,
        },
      };
      const newValues = {
        home: {
          address: 'World street, 56',
        },
        car: {
          engine: {
            type: 'electro',
          },
          mode: '4wd',
        },
      };
      const newCarOwner = sut.hardReplaceAttrs(carOwner, newValues);

      const expectDto: ReplaceDtoAttrs<typeof carOwner, typeof newValues> = {
        name: 'Bill',
        home: {
          address: 'World street, 56',
        },
        car: {
          model: 'Audi',
          engine: {
            type: 'electro',
          },
        },
      };
      expect(newCarOwner).toEqual(expectDto);
    });

    test('жесктая замена добавление несуществующего атрибута не приводит к изменениям', () => {
      const carOwner = {
        name: 'Bill',
        car: {
          model: 'Audi',
          engine: null,
        },
      };
      const newValues = {
        age: 32,
        car: {
          mode: '4wd',
          engine: {},
        },
      };
      const newCarOwner = sut.hardReplaceAttrs(carOwner, newValues);

      const expectDto: ReplaceDtoAttrs<typeof carOwner, typeof newValues> = {
        name: 'Bill',
        car: {
          model: 'Audi',
          engine: {},
        },
      };
      expect(newCarOwner).toEqual(expectDto);
    });
  });

  describe('тестирование расширения атрибутов Dto', () => {
    const personDto = {
      firstName: 'nur',
      lastName: 'ama',
      age: 42,
    };

    test('атрибуты обновляются, получилию копию объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newAttrs = { age: 43 };

      const newPersonDto = sut.extendAttrs(copiedPersonDto, newAttrs);

      expect(newPersonDto).not.toBe(copiedPersonDto);

      expect(newPersonDto.firstName).toBe(personDto.firstName);
      expect(newPersonDto.lastName).toBe(personDto.lastName);
      expect(newPersonDto.age).toBe(newAttrs.age);
    });

    test('атрибуты обновляются, получилию тот же объект', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newAttrs = { age: 43 };

      const newPersonDto = sut.extendAttrs(copiedPersonDto, newAttrs, false);

      expect(newPersonDto).toBe(copiedPersonDto);

      expect(newPersonDto.firstName).toBe(personDto.firstName);
      expect(newPersonDto.lastName).toBe(personDto.lastName);
      expect(newPersonDto.age).toBe(newAttrs.age);
    });

    test('новые атриубты добавляются в возвращаемый объект', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newAttrs = { sex: 'man', phone: ['first phone number'] };

      const newPersonDto = sut.extendAttrs(copiedPersonDto, newAttrs);

      expect(newPersonDto.firstName).toBe(personDto.firstName);
      expect(newPersonDto.lastName).toBe(personDto.lastName);
      expect(newPersonDto.age).toBe(personDto.age);
      expect(newPersonDto.sex).toBe(newAttrs.sex);
      expect(newPersonDto.phone).toBe(newAttrs.phone);
    });

    test('возвращается объект с типом второго объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: '1 year' };

      const newPersonDto = sut.extendAttrs(copiedPersonDto, newValues);

      expect(newPersonDto.firstName).toBe(personDto.firstName);
      expect(newPersonDto.lastName).toBe(personDto.lastName);
      expect(newPersonDto.age).toBe(newValues.age);
    });

    test('переданный атрибут со значением undefine копируется в возращаемое значение', () => {
      const copiedPersonDto = sut.deepCopy(personDto);
      const newValues = { age: undefined };

      const newPersonDto = sut.extendAttrs(copiedPersonDto, newValues);

      expect(newPersonDto.firstName).toBe(personDto.firstName);
      expect(newPersonDto.lastName).toBe(personDto.lastName);
      expect(newPersonDto.age).toBe(undefined);
    });
  });

  describe('тестироваине удаления атрибутов объекта', () => {
    const personDto = {
      firstName: 'nur',
      lastName: 'ama',
      age: 42,
    };

    test('убирается один атрибут, получили копию объекта', () => {
      const copiedPersonDto = sut.deepCopy(personDto);

      const newPersonDto = sut.excludeAttrs(copiedPersonDto, 'age');

      expect(newPersonDto).not.toBe(copiedPersonDto);
      const recievedAttrKeys = new Set(Object.keys(newPersonDto));
      const expectedAttrKeys = new Set(['firstName', 'lastName']);
      expect(recievedAttrKeys).toEqual(expectedAttrKeys);
    });

    test('убирается один атрибут, получили тот же объект', () => {
      const copiedPersonDto = sut.deepCopy(personDto);

      const newPersonDto = sut.excludeAttrs(copiedPersonDto, 'age', false);

      expect(newPersonDto).toBe(copiedPersonDto);
      const recievedAttrKeys = new Set(Object.keys(newPersonDto));
      const expectedAttrKeys = new Set(['firstName', 'lastName']);
      expect(recievedAttrKeys).toEqual(expectedAttrKeys);
    });
  });
  // Надо исправить ошибку с типами и проверить метод excludeDeepAttrs TODO: Нурболат
  describe('тест метода excludeDeepAttrs', () => {
    const personDto = {
      firstName: 'Donald',
      lastName: 'Jumper',
      contacts: {
        phone: {
          code: '+7',
          num: '53252332',
        },
        email: {
          address: 'donald@example.com',
        },
      },
    };

    test('Уберем атрибут первого уровня', () => {
      const attrToDelete = 'firstName';

      const expectedDto = {
        lastName: 'Jumper',
        contacts: {
          phone: {
            code: '+7',
            num: '53252332',
          },
          email: {
            address: 'donald@example.com',
          },
        },
      };

      const result = dtoUtility.excludeDeepAttrsByKeys(personDto, attrToDelete);
      expect(result).toEqual(expectedDto);
    });

    test('Уберем атрибут второго уровня', () => {
      const attrToDelete = 'contacts.phone';

      const expectedDto = {
        firstName: 'Donald',
        lastName: 'Jumper',
        contacts: {
          email: {
            address: 'donald@example.com',
          },
        },
      };

      const result = dtoUtility.excludeDeepAttrsByKeys(personDto, attrToDelete);
      expect(result).toEqual(expectedDto);
    });

    test('Уберем атрибут третьего уровня', () => {
      const attrToDelete = 'contacts.email.address';

      const expectedDto = {
        firstName: 'Donald',
        lastName: 'Jumper',
        contacts: {
          phone: {
            code: '+7',
            num: '53252332',
          },
          email: {
          },
        },
      };

      const result = dtoUtility.excludeDeepAttrsByKeys(personDto, attrToDelete);
      expect(result).toEqual(expectedDto);
    });

    // Не работает метод когда массив строк TODO: Нурболат
    test('Уберем несколько атрибутов разного уровня', () => {
      // TODO сделать чтобы можно было передавать readonly tuple;
      const attrsToDelete: ['contacts.email.address', 'lastName'] = ['contacts.email.address', 'lastName'];

      const expectedDto = {
        firstName: 'Donald',
        contacts: {
          phone: {
            code: '+7',
            num: '53252332',
          },
          email: {
          },
        },
      };
      const result = dtoUtility.excludeDeepAttrsByKeys(personDto, attrsToDelete);
      expect(result).toEqual(expectedDto);
    });

    // Не работает метод когда массив строк TODO: Нурболат
    test('Проверка, что оригинал не трогается.', () => {
      const personDtoCopy = sut.deepCopy(personDto);
      const attrsToDelete: ['firstName', 'contacts.phone'] = ['firstName', 'contacts.phone'];
      const result = dtoUtility.excludeDeepAttrsByKeys(personDto, attrsToDelete);

      expect(result).not.toEqual(personDto);
      expect(personDto).toStrictEqual(personDtoCopy);
    });
  });

  describe('Тестирование объединения объектов, исключая undefined атрибуты', () => {
    test('', async () => {
      type A = {
        a?: boolean,
        b?: string,
        c?: boolean,
      }
      const object1: A = {
        b: 'ok',
        c: false,
      };
      const object2: A = {
        a: false,
        b: 'okdsf',
        c: true,
      };

      expect(sut.mergeObjects(object1, object2)).toMatchObject({
        a: false,
        b: 'ok',
        c: false,
      });

      expect(sut.mergeObjects(object2, object1)).toMatchObject({
        a: false,
        b: 'okdsf',
        c: true,
      });
    });
  });

  describe('Получение значения объекта по вложенному ключу (DeepAttr)', () => {
    const storeDto = {
      categories: {
        products: {
          banana: {
            price: 10,
          },
        },
      },
    };

    test('Успех. Без вложенности.', () => {
      const result = dtoUtility.getValueByDeepAttr(storeDto, 'categories');
      expect(result).toMatchObject({ products: { banana: { price: 10 } } });
    });

    test('Успех. Одинарная вложенность.', () => {
      const result = dtoUtility.getValueByDeepAttr(storeDto, 'categories.products');
      expect(result).toMatchObject({ banana: { price: 10 } });
    });

    test('Успех. Двойная вложенность.', () => {
      const result = dtoUtility.getValueByDeepAttr(storeDto, 'categories.products.banana');
      expect(result).toMatchObject({ price: 10 });
    });

    test('Успех. Полная вложенность', () => {
      const result = dtoUtility.getValueByDeepAttr(storeDto, 'categories.products.banana.price');
      expect(result).toBe(10);
    });

    test('После вызова метода исходный объект не изменен.', () => {
      const storeDtoCopy = dtoUtility.deepCopy(storeDto);
      dtoUtility.getValueByDeepAttr(storeDto, 'categories.products.banana');
      expect(storeDto).toStrictEqual(storeDtoCopy);
    });

    test('Если запрашиваемый ключ - объект, '
        + 'то получаем действительную ссылку на него, а не копию.', () => {
      const banana = dtoUtility.getValueByDeepAttr<{ price: number }>(
        storeDto,
        'categories.products.banana',
      ) as { price: number };
      const newBananaPrice = 25;
      banana.price = newBananaPrice;
      expect(storeDto.categories.products.banana.price).toBe(newBananaPrice);
    });

    test('Не успех. Ключ отсутствует.', () => {
      expect(dtoUtility.getValueByDeepAttr(storeDto, 'unknown'))
        .toBeUndefined();
    });

    test('Не успех. Ключ отсутствует. Исключение', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, 'unknown', true))
        .toThrow(new AssertionException('В объекте {"categories":{"products":{"banana":{"price":25}}}} отсутствует вложенный ключ unknown.'));
    });

    test('Не успех. Ключ отсутствует (вложенный).', () => {
      expect(dtoUtility.getValueByDeepAttr(storeDto, 'categories.unknown'))
        .toBeUndefined();
    });

    test('Не успех. Ключ отсутствует (вложенный). Исключение', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, 'categories.unknown', true))
        .toThrow(new AssertionException('В объекте {"categories":{"products":{"banana":{"price":25}}}} отсутствует вложенный ключ categories.unknown.'));
    });

    test('Не успех. Ключ отсутствует (вложенный несколько раз).', () => {
      expect(dtoUtility.getValueByDeepAttr(storeDto, 'categories.unknown.fake.another'))
        .toBeUndefined();
    });

    test('Не успех. Ключ отсутствует (вложенный несколько раз). Исключение', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, 'categories.unknown.fake.another', true))
        .toThrow(new AssertionException('В объекте {"categories":{"products":{"banana":{"price":25}}}} отсутствует вложенный ключ categories.unknown.fake.another.'));
    });

    test('Не успех. Ключ начинается с точки', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, '.categories'))
        .toThrow(new AssertionException('Ключ .categories не может начинаться или заканчиваться точкой и не может быть пустым'));
    });

    test('Не успех. Ключ заканчивается точкой', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, 'categories.'))
        .toThrow(new AssertionException('Ключ categories. не может начинаться или заканчиваться точкой и не может быть пустым'));
    });

    test('Не успех. Ключ пустая строка', () => {
      expect(() => dtoUtility.getValueByDeepAttr(storeDto, ''))
        .toThrow(new AssertionException('Ключ  не может начинаться или заканчиваться точкой и не может быть пустым'));
    });
  });

  describe('Метод getUniqueKeys', () => {
    test('одинаковые ключи', () => {
      const input = [{ a: 5, b: 5 }, { a: 7 }];
      expect(dtoUtility.getUniqueKeys(input)).toEqual(['a', 'b']);
    });

    test('дополнительный ключ', () => {
      const input = [{ a: 5, b: 5 }, { a: 7, c: 7 }, { a: 8, b: 6 }];
      expect(dtoUtility.getUniqueKeys(input)).toEqual(['a', 'b', 'c']);
    });

    test('множество разных ключей', () => {
      const input = [{ a: 5, b: 5 }, { a: 7, c: 7 }, { d: 8, b: 6 }];
      expect(dtoUtility.getUniqueKeys(input)).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('Метод editKeys', () => {
    const input = { name: 'bill', age: 15 };
    test('успех, добавлены префиксы одиночным символом доллара', () => {
      expect(dtoUtility.editKeys(input, (key) => `$${key}`)).toEqual({ $name: 'bill', $age: 15 });
    });

    test('успех, ключи переведены в верхний регистр', () => {
      expect(dtoUtility.editKeys(input, (key) => key.toUpperCase())).toEqual({ NAME: 'bill', AGE: 15 });
    });
  });

  describe('Метод editValues', () => {
    const input = { name: 'bill', age: 15 };
    test('успех, выполнено приведение типов в текст', () => {
      expect(dtoUtility.editValues(input, (value) => String(value))).toEqual({ name: 'bill', age: '15' });
    });

    test('успех, строковые значения переведены на ПРОПИСНОЙ', () => {
      const cb = (vl: unknown): unknown => (typeof vl === 'string' ? vl.toUpperCase() : vl);
      expect(dtoUtility.editValues(input, cb)).toEqual({ name: 'BILL', age: 15 });
    });
  });

  describe('Метод isDto', () => {
    test('Object: true', () => {
      expect(dtoUtility.isDto({ param: 'value' })).toBe(true);
    });

    test('String: false', () => {
      expect(dtoUtility.isDto('myString')).toBe(false);
    });

    test('Array: false', () => {
      expect(dtoUtility.isDto(['a', 'b', 'c'])).toBe(false);
    });

    test('Set: false', () => {
      expect(dtoUtility.isDto(new Set([1, 2, 4]))).toBe(false);
    });

    test('Date: false', () => {
      expect(dtoUtility.isDto(new Date())).toBe(false);
    });

    test('Undefined: false', () => {
      expect(dtoUtility.isDto(undefined)).toBe(false);
    });

    test('Null: false', () => {
      expect(dtoUtility.isDto(null)).toBe(false);
    });
  });
});
