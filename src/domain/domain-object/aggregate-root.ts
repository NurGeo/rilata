import { dtoUtility } from '../../core/utils/dto/dto-utility.js';
import { GeneralArParams } from '../index.js';
import { DtoFieldValidator } from '../validator/field-validator/dto-field-validator.js';
import { AggregateRootHelper } from './aggregate-helper.js';

/** Корневой объект - т.е имеет уникальную глобальную идентификацию */
export abstract class AggregateRoot<PARAMS extends GeneralArParams> {
  protected helper: AggregateRootHelper<PARAMS>;

  /** Обычно используется для идентификации пользователем объекта в списке */
  abstract getShortName(): string

  constructor(
    protected attrs: PARAMS['attrs'],
    invariantsValidator: DtoFieldValidator<string, true, false, PARAMS['attrs']>,
    aRootName: PARAMS['meta']['name'],
    idName: keyof PARAMS['attrs'] & string,
    version: number,
    outputExcludeAttrs: PARAMS['noOutKeys'],
  ) {
    this.helper = new AggregateRootHelper<PARAMS>(
      attrs, aRootName, idName, version, outputExcludeAttrs,
    );
    this.checkInveriants(invariantsValidator, attrs);
  }

  getId(): string {
    return this.helper.getId();
  }

  getAttrs(conf: { copy: boolean } = { copy: true }): PARAMS['attrs'] {
    return conf.copy ? dtoUtility.deepCopy(this.attrs) : this.attrs;
  }

  /** Обычно используется для логирования, например в ошибках. */
  toString(): string {
    return `${this.helper.getName()} aggregate root: id-${this.getId()}`;
  }

  getHelper(): AggregateRootHelper<PARAMS> {
    return this.helper;
  }

  protected checkInveriants(
    validator: DtoFieldValidator<string, true, false, PARAMS['attrs']>,
    attrs: PARAMS['attrs'],
  ): void {
    const invariantsResult = validator.validate(attrs);
    if (invariantsResult.isFailure()) {
      throw this.getHelper().getLogger().error(`не соблюдены инварианты агрегата ${this.constructor.name}`, {
        modelAttrs: attrs,
        validatorValue: invariantsResult.value,
      });
    }
  }
}
