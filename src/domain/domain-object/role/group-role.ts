import { UserId } from '../../../core/types.js';
import { GroupRoleAttrs } from '../types.js';

export abstract class GroupRole<A extends GroupRoleAttrs> {
  constructor(protected attrs: A) {}

  inThisRole(userId: UserId): boolean {
    return this.attrs.userIds.some((listUserId) => listUserId === userId);
  }
}
