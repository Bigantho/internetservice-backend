import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level:     'warning',
  format:     combine(timestamp(), logFormat),
  transports: [
    new winston.transports.File({ filename: (process.env.LOG_PATH ?? 'storage/logs') + '/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  // Print to the console for real-time debugging on development
  logger.add(new winston.transports.Console({ level: 'info' }));
}

export default logger;