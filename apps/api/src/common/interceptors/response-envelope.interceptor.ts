import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, { data: T; meta: { requestId?: string } }>
{
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<{ data: T; meta: { requestId?: string } }> {
    const request = context.switchToHttp().getRequest<{ id?: string }>();

    return next.handle().pipe(
      map((data) => {
        const meta = request.id ? { requestId: request.id } : {};

        return {
          data,
          meta,
        };
      }),
    );
  }
}
