import { describe, expect, test } from 'bun:test';
import { Role } from '../../../../src/domain/domain-object/role/role.js';
import { RoleAttrs } from '../../../../src/domain/domain-object/types.js';

describe('Тесты объекта Role', () => {
  class WorkshopOwnerRole extends Role<RoleAttrs> {}
  describe('Тесты для проверки находится ли пользователь в этой роли', () => {
    test('Успех, пользователь находится в этой роли', () => {
      const role = new WorkshopOwnerRole({ userId: 'any user id' });
      expect(role.inThisRole('any user id')).toBe(true);
    });

    test('Провал, пользователь не находится в этой роли', () => {
      const role = new WorkshopOwnerRole({ userId: 'any user id' });
      expect(role.inThisRole('other user id')).toBe(false);
    });
  });
});
