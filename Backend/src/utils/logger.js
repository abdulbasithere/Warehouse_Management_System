const winston = require('winston');
const path = require('path');

// Define log directory
const logDir = path.join(__dirname, '../../logs');

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Custom format for file output (JSON structured)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'wms-backend' },
    transports: [
        // Console transport — always enabled
        new winston.transports.Console({
            format: consoleFormat
        }),

        // Combined log — all levels
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,  // 10MB per file
            maxFiles: 5,                 // keep 5 rotated files
            tailable: true
        }),

        // Error log — errors only
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
            tailable: true
        }),

        // HTTP request log — info level for request logging
        new winston.transports.File({
            filename: path.join(logDir, 'requests.log'),
            level: 'http',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
            tailable: true
        })
    ]
});

module.exports = logger;
