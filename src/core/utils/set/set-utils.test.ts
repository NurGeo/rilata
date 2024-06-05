/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect } from 'bun:test';
import { setUtils } from './set-utils.js';

describe('Set', () => {
  const sut = setUtils;
  test('test intersection', async () => {
    let result: Set<any>;
    result = sut.intersection(new Set([1, 2]), new Set([4, 5]));
    expect(result).toMatchObject(new Set());
    result = sut.intersection(new Set([1, 2]), new Set([4, '']));
    expect(result).toMatchObject(new Set());
    result = sut.intersection(new Set([1, 2]), new Set([4, 1]));
    expect(result).toMatchObject(new Set([1]));
    result = sut.intersection(
      new Set(['dasfsd', 2, 'ok', 4]),
      new Set([4, 'sdafsd', 'ok']),
    );
    expect(result).toMatchObject(new Set(['ok', 4]));
  });

  test('test union', async () => {
    let result: Set<any>;
    result = sut.union(new Set([1, 2]), new Set([4, 5]));
    expect(result).toMatchObject(new Set([1, 2, 4, 5]));
    result = sut.union(new Set([1, 2]), new Set([4, '']));
    expect(result).toMatchObject(new Set([1, 2, 4, '']));
    result = sut.union(new Set([1, 2]), new Set([4, 1]));
    expect(result).toMatchObject(new Set([4, 1, 2]));
    result = sut.union(
      new Set(['dasfsd', 2, 'ok', 4]),
      new Set([4, 'sdafsd', 'ok']),
    );
    expect(result).toMatchObject(new Set(['dasfsd', 2, 'ok', 4, 'sdafsd']));
  });

  test('test difference', async () => {
    let result: Set<any>;
    result = sut.difference(new Set([1, 2]), new Set([4, 5]));
    expect(result).toMatchObject(new Set([1, 2]));
    result = sut.difference(new Set([1, 2]), new Set([4, '']));
    expect(result).toMatchObject(new Set([1, 2]));
    result = sut.difference(new Set([1, 2]), new Set([4, 1]));
    expect(result).toMatchObject(new Set([2]));
    result = sut.difference(
      new Set(['dasfsd', 2, 'ok', 4]),
      new Set([4, 'sdafsd', 'ok']),
    );
    expect(result).toMatchObject(new Set(['dasfsd', 2]));
  });

  test('test join', async () => {
    const result = sut.join([
      ['a', 'b'],
      ['a', 'c', 1],
      ['b'],
      ['a', 'd'],
    ]);
    expect(result).toMatchObject(new Set(['a', 'b', 'c', 1, 'd']));
  });
});
