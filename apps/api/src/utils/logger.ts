import winston from 'winston';
import { Request } from 'express';

export interface LogMetadata {
  error?: string;
  stack?: string;
  requestId?: string;
  method?: string;
  path?: string;
  duration?: number;
  [key: string]: any;
}

export interface Logger {
  info(message: string, meta?: LogMetadata): void;
  error(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  debug(message: string, meta?: LogMetadata): void;
  http(message: string, meta?: LogMetadata): void;
}

// Create base logger instance
const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...metadata,
      });
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  baseLogger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  baseLogger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export function createLogger(service: string): Logger {
  return {
    info: (message: string, meta: LogMetadata = {}) => {
      baseLogger.info(message, { service, ...meta });
    },
    error: (message: string, meta: LogMetadata = {}) => {
      baseLogger.error(message, { service, ...meta });
    },
    warn: (message: string, meta: LogMetadata = {}) => {
      baseLogger.warn(message, { service, ...meta });
    },
    debug: (message: string, meta: LogMetadata = {}) => {
      baseLogger.debug(message, { service, ...meta });
    },
    http: (message: string, meta: LogMetadata = {}) => {
      baseLogger.http(message, { service, ...meta });
    },
  };
}

// Request context logger
export function createRequestLogger(req: Request): Logger {
  const requestMeta = {
    requestId: req.id,
    method: req.method,
    path: req.path,
  };

  return {
    info: (message: string, meta: LogMetadata = {}) => {
      baseLogger.info(message, { ...requestMeta, ...meta });
    },
    error: (message: string, meta: LogMetadata = {}) => {
      baseLogger.error(message, { ...requestMeta, ...meta });
    },
    warn: (message: string, meta: LogMetadata = {}) => {
      baseLogger.warn(message, { ...requestMeta, ...meta });
    },
    debug: (message: string, meta: LogMetadata = {}) => {
      baseLogger.debug(message, { ...requestMeta, ...meta });
    },
    http: (message: string, meta: LogMetadata = {}) => {
      baseLogger.http(message, { ...requestMeta, ...meta });
    },
  };
}

// Performance logger
export const perfLogger = {
  start: (label: string) => {
    const start = process.hrtime();
    return {
      end: () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds
        const logger = createLogger('performance');
        logger.debug(`${label} completed`, { duration });
        return duration;
      },
    };
  },
}; 