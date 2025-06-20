import { HttpStatus } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from 'src/common/interfaces/response.interface';

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
    error: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiErrorResponse {
    return {
      statusCode,
      message,
      error,
    };
  }
}
