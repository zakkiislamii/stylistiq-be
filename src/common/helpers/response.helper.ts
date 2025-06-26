import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from 'src/contracts/interfaces/response.interface';
import { Response } from 'express';

export class ResponseHelper {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK,
  ): ApiSuccessResponse<T> {
    return {
      statusCode,
      message,
      data,
    };
  }

  static error(
    message: string,
    error: string | string[],
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiErrorResponse {
    return {
      statusCode,
      message,
      error,
    };
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | string[] = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;

      const exceptionName = exception.constructor.name;
      error = exceptionName
        .replace(/Exception$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
    } else if (exception instanceof Error) {
      error = exception.message;
    }

    const errorResponse =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? ResponseHelper.error(message, error, status)
        : ResponseHelper.error(message, error, status);

    response.status(status).json(errorResponse);
  }
}
