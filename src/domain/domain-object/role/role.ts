import { UserId } from '../../../core/types.js';
import { RoleAttrs } from '../types.js';

export abstract class Role<A extends RoleAttrs> {
  constructor(protected attrs: A) {}

  inThisRole(userId: UserId): boolean {
    return userId === this.attrs.userId;
  }
}
