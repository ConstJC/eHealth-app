import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection.remoteAddress;
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`➡️  ${method} ${url} - ${ip} - ${userAgent}`);

    // Log request body (excluding sensitive data)
    if (Object.keys(body || {}).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      if (Object.keys(sanitizedBody).length > 0) {
        this.logger.debug(`   Body: ${JSON.stringify(sanitizedBody)}`);
      }
    }

    // Log query parameters
    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`   Query: ${JSON.stringify(query)}`);
    }

    // Log route parameters
    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`   Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.log(`✅ ${method} ${url} ${statusCode} - ${duration}ms`);

          // Log response data (truncated for large responses)
          if (data && typeof data === 'object') {
            const responseStr = JSON.stringify(data);
            if (responseStr.length > 500) {
              this.logger.debug(
                `   Response: ${responseStr.substring(0, 500)}... (truncated)`,
              );
            } else {
              this.logger.debug(`   Response: ${responseStr}`);
            }
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || 500;

          // Log error response
          this.logger.error(
            `❌ ${method} ${url} ${statusCode} - ${duration}ms - ${error?.message || 'Unknown error'}`,
          );
        },
      }),
    );
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
