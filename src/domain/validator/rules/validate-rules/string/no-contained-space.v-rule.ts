import { RegexDoesntMatchValidationRule } from './regex-doesnt-match-value.field-v-rule.js';

export class NoContainedSpaсeValidationRule extends RegexDoesntMatchValidationRule {
  constructor() {
    super(/\s/, 'Не должно быть пробелов');
  }
}
