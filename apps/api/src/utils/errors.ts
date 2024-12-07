export type ErrorCode = 
  | 'AUTH_MISSING'
  | 'AUTH_INVALID_TYPE'
  | 'AUTH_INVALID_FORMAT'
  | 'AUTH_INVALID_SIGNATURE'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_REQUIRED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_FAILED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'INVALID_CONTENT'
  | 'INVALID_PARAMETER'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'ACCOUNT_SUSPENDED'
  | 'AMOUNT_EXCEEDED'
  | 'INVALID_ADDRESS'
  | 'INVALID_PROMPT'
  | 'TOKEN_LIMIT_EXCEEDED'
  | 'INVALID_SAFETY_LEVEL';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code: ErrorCode = 'INVALID_REQUEST', details?: unknown) {
    return new ApiError(message, 400, code, details);
  }

  static unauthorized(message: string, code: ErrorCode = 'AUTH_REQUIRED', details?: unknown) {
    return new ApiError(message, 401, code, details);
  }

  static forbidden(message: string, code: ErrorCode = 'AUTH_FORBIDDEN', details?: unknown) {
    return new ApiError(message, 403, code, details);
  }

  static notFound(message: string, code: ErrorCode = 'NOT_FOUND', details?: unknown) {
    return new ApiError(message, 404, code, details);
  }

  static tooManyRequests(message: string, code: ErrorCode = 'RATE_LIMIT_EXCEEDED', details?: unknown) {
    return new ApiError(message, 429, code, details);
  }

  static internal(message: string, code: ErrorCode = 'INTERNAL_ERROR', details?: unknown) {
    return new ApiError(message, 500, code, details);
  }

  static validation(details: unknown) {
    return new ApiError('Validation Error', 400, 'VALIDATION_ERROR', details);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details ? { details: this.details } : {})
      }
    };
  }
}

export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super('Validation Error', 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string, code: ErrorCode = 'AUTH_FAILED', details?: unknown) {
    super(message, 401, code, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string, code: ErrorCode = 'AUTH_FORBIDDEN', details?: unknown) {
    super(message, 403, code, details);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
} 