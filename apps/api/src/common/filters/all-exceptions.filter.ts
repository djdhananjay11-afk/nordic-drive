import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const isProduction = process.env.NODE_ENV === "production";
    const message =
      isProduction && status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? "Unexpected server error"
        : exception instanceof Error
          ? exception.message
          : "Unexpected server error";

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    } else {
      this.logger.warn(exception instanceof Error ? exception.message : exception);
    }

    response.status(status).json({
      error: {
        code: exception instanceof HttpException ? exception.name : "InternalServerError",
        message,
      },
    });
  }
}
