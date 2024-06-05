import { BadRequestError } from '../../api/service/error-types.js';
import { FullServiceResult, FullServiceResultDTO, GeneralCommandServiceParams, GeneralQueryServiceParams } from '../../api/service/types.js';
import { JwtDecoder } from '../../core/jwt/jwt-decoder.js';
import { Logger } from '../../core/logger/logger.js';
import { failure } from '../../core/result/failure.js';
import { success } from '../../core/result/success.js';
import { Result } from '../../core/result/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { DTO } from '../../domain/dto.js';
import { Locale } from '../../domain/locale.js';

export abstract class BackendApi {
    protected abstract moduleUrl: string;

    constructor(protected jwtDecoder: JwtDecoder<DTO>, protected logger: Logger) {}

    /** делает запрос в бэкенд и возвращает результат.
      @param {Object} requestDod - объект типа RequestDod.
      @param {string} jwtToken - jwt токен авторизации (рефреш).
        Для неавторизованного запроса передать пустую строку. */
    async request<SERVICE_PARAMS extends GeneralQueryServiceParams | GeneralCommandServiceParams>(
      requestDod: SERVICE_PARAMS['input'],
      jwtToken: string,
    ): Promise<FullServiceResult<SERVICE_PARAMS>> {
      if (jwtToken && this.jwtDecoder.dateIsExpired(jwtToken)) {
        return this.jwtDecoder.getError('TokenExpiredError');
      }

      const backendResult = await fetch(this.moduleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: jwtToken ? `Bearer ${jwtToken}` : '',
        },
        body: JSON.stringify(requestDod),
      });

      const resultDto = await backendResult.json();
      return this.resultDtoToResult(resultDto);
    }

    protected resultDtoToResult<P extends GeneralQueryServiceParams | GeneralCommandServiceParams>(
      resultDto: FullServiceResultDTO<P>,
    ): FullServiceResult<P> {
      if (resultDto.success === false) {
        return failure(resultDto.payload);
      }
      if (resultDto.success === true) {
        return success(resultDto.payload);
      }
      return this.notResultDto(resultDto);
    }

    private notResultDto(value: unknown): Result<BadRequestError<Locale<'Bad request'>>, never> {
      this.logger.error('response value is not resultDto', value);
      return failure(dodUtility.getDomainError('Bad request', 'Ошибка сети', {}));
    }
}
