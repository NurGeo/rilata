import { describe, test, expect } from 'bun:test';
import { arrayUtility } from './array-utility.js';

describe('arrayUtility class', () => {
  test('перемешать содержимое списка случайным образом', async () => {
    const testArray = new Array(1000);
    for (let i = 0; i < testArray.length; i += 1) {
      testArray[i] = Math.random();
    }
    const res = arrayUtility.shuffle(testArray);

    function check<T>(arr: Array<T>, resArr: Array<T>): void {
      expect(arr).toHaveLength(resArr.length);
      expect(arr).not.toMatchObject(resArr);

      arr.forEach((value) => {
        expect(resArr.includes(value)).toBeTruthy();
      });
    }

    check(testArray, res);

    const res2 = arrayUtility.shuffle(res);

    check(res, res2);
  });

  test('объединить содержимое двух массивов в один в виде кортежа', async () => {
    expect(arrayUtility.zip([1, 2], [3, 4])).toMatchObject([[1, 3], [2, 4]]);
    expect(arrayUtility.zip([1, 2], ['a', 'n'])).toMatchObject([[1, 'a'], [2, 'n']]);
    expect(arrayUtility.zip([1, 2], [4])).toMatchObject([[1, 4], [2, undefined]]);
    expect(arrayUtility.zip([1], [2, 4])).toMatchObject([[1, 2], [undefined, 4]]);
    expect(arrayUtility.zip([1, 2], [2, 'n'])).toMatchObject([[1, 2], [2, 'n']]);
  });

  test('удалить из массива повторяющиеся значения', () => {
    const testArrays = [
      // inArray, expectArray
      [[1, 2, 's'], [1, 2, 's']], // not duplicates
      [[], []], // empty array
      [['1'], ['1']], // one value array
      [[1, 'a', 1, 3], [1, 'a', 3]], // one duplicate
      [[1, 3, 5, 1, 6, 2, 1, 11], [1, 3, 5, 6, 2, 11]], // more duplicates
    ];
    testArrays.forEach(([inputArray, expectArray]) => {
      expect(arrayUtility.removeDuplicateValues(inputArray)).toEqual(expectArray);
    });
  });

  describe('проверить что содержимое массивов одинакова', () => {
    test('ожидается положительный ответ', () => {
      const testArrays = [
        [[1, 2, 3], [1, 2, 3]], // equal arrays
        [[1, 2, 6, 3], [3, 6, 1, 2]], // mixed values
        [[1, 6, 'a'], ['a', 6, 1]], // diff types
        [[1], [1]], // one value
        [[], []], // empty arrays
      ];
      testArrays.forEach(([firstArray, secondArray]) => {
        expect(arrayUtility.arrayValuesAreEqual(firstArray, secondArray)).toBe(true);
      });
    });

    test('ожидается отрицательный ответ', () => {
      const testArrays = [
        [[1, 2, 3], [1, 2]], // item counts is not equal, missiong item
        [[1, 2, 3], [1, 2, 2, 3]], // item counts is not equal, extra item
        [[1, 2, 3], [1, 4, 2]], // values is not equal
        [[1, 2, 6, 3], ['3', 6, 1, 2]], // other type
        [[1, 2, 6, 3], [3, 6, true, 2]], // other type
      ];
      testArrays.forEach(([firstArray, secondArray]) => {
        expect(arrayUtility.arrayValuesAreEqual(firstArray, secondArray)).toBe(false);
      });
    });
  });

  describe('проверить что значения массивов одинакова, (не учитывать повторения)', () => {
    test('ожидается положительный ответ', () => {
      const testArrays = [
        [[1, 2, 3], [1, 2, 3]], // equal arrays
        [[1, 2, 3], [1, 2, 2, 3]], // item counts is not equal, extra item
        [[1, 2, 6, 3], [3, 6, 1, 2]], // mixed values
        [[1, 3, 2, 6, 3, 1], [3, 6, 3, 2, 1, 2]], // mixed values, and extra items
        [[1, 6, 'a', 6], ['a', 6, 1, 'a']], // diff types
        [[1], [1, 1, 1]], // one value
        [[], []], // empty arrays
      ];
      testArrays.forEach(([firstArray, secondArray]) => {
        expect(arrayUtility.arraysEqualAsSet(firstArray, secondArray)).toBe(true);
      });
    });

    test('ожидается отрицательный ответ', () => {
      const testArrays = [
        [[1, 2, 3], [1, 2]], // item counts is not equal, missing item
        [[1, 2, 3], [1, 4, 2]], // values is not equal
        [[1, 2, 6, 3], ['3', 6, 1, 2]], // other type
        [[1, 2, 6, 3], [3, 6, true, 2]], // other type
      ];
      testArrays.forEach(([firstArray, secondArray]) => {
        expect(arrayUtility.arraysEqualAsSet(firstArray, secondArray)).toBe(false);
      });
    });
  });
});
