import winston from 'winston';
import { config } from '../config/environment';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

export const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                logFormat
            )
        }),
        new winston.transports.File({
            filename: config.logging.filePath,
            format: winston.format.combine(
                winston.format.timestamp(),
                logFormat
            )
        })
    ],
    exitOnError: false
}); 