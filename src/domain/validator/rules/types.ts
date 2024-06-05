import { Locale } from '../../locale.js';
import { ValidationRule } from './validation-rule.js';

export type RuleType = 'nullable' |'type' | 'assert' | 'validate';

export type LiteralDataType = string | number | boolean;

export type RuleDataType = LiteralDataType | unknown;

export type GeneralValidationRule = ValidationRule<RuleType, RuleDataType>;

export type RuleError = Locale

export type SuccessRunNextRule = { behaviour: 'SuccessRunNextRule' };

export type SuccessBreakValidation = { behaviour: 'SuccessBreakValidation' };

export type SaveErrorAndBreakValidation = {
  behaviour: 'SaveErrorAndBreakValidation',
  ruleError: RuleError,
};

export type SaveErrorAndRunNextRule = {
  behaviour: 'SaveErrorAndRunNextRule',
  ruleError: RuleError,
};

export type ValidationRuleAnswer =
  SuccessRunNextRule
  | SuccessBreakValidation
  | SaveErrorAndRunNextRule
  | SaveErrorAndBreakValidation;

export type TypeOrAssertRuleAnswer = SuccessRunNextRule | SaveErrorAndBreakValidation;

export type EmptyValueRuleAnswer = SuccessRunNextRule | SuccessBreakValidation;

export type GetRuleAnswer<RT extends RuleType> =
  RT extends 'type' | 'assert'
    ? TypeOrAssertRuleAnswer
    : RT extends 'nullable'
      ? EmptyValueRuleAnswer
      : ValidationRuleAnswer

export type GetSuccessRuleAnswer<RT extends RuleType> =
  Extract<GetRuleAnswer<RT>, SuccessRunNextRule | SuccessBreakValidation>;

export type GetFailRuleAnswer<RT extends RuleType> =
  Extract<GetRuleAnswer<RT>, SaveErrorAndRunNextRule | SaveErrorAndBreakValidation>;

type GetBehavourString<RT extends RuleType> =
  GetRuleAnswer<RT> extends ValidationRuleAnswer
    ? GetRuleAnswer<RT>['behaviour']
    : never;

export type GetSuccessBehaviourString<RT extends RuleType> =
  Extract<GetBehavourString<RT>, 'SuccessRunNextRule' | 'SuccessBreakValidation'>;

export type GetFailBehaviourString<RT extends RuleType> =
  Extract<GetBehavourString<RT>, 'SaveErrorAndBreakValidation' | 'SaveErrorAndRunNextRule'>;
