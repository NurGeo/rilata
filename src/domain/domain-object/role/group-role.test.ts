import { describe, expect, test } from 'bun:test';
import { GroupRole } from '../../../../src/domain/domain-object/role/group-role.js';
import { GroupRoleAttrs } from '../../../../src/domain/domain-object/types.js';

describe('Тесты объекта GroupRole', () => {
  class WorkshopManagersRole extends GroupRole<GroupRoleAttrs> {}
  describe('Тесты для проверки находится ли пользователь в этой групповой роли', () => {
    test('Успех, пользователь находится в этой роли', () => {
      const role = new WorkshopManagersRole({ userIds: ['first user id', 'second user id'] });
      expect(role.inThisRole('first user id')).toBe(true);
      expect(role.inThisRole('second user id')).toBe(true);
    });

    test('Провал, пользователь не находится в этой роли', () => {
      const role = new WorkshopManagersRole({ userIds: ['first user id', 'second user id'] });
      expect(role.inThisRole('third user id')).toBe(false);
    });
  });
});
