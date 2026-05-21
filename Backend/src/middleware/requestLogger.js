const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom morgan token: response body size
morgan.token('res-body-size', (req, res) => {
    const size = res.getHeader('content-length');
    if (size) {
        const kb = (parseInt(size) / 1024).toFixed(2);
        return `${kb}KB`;
    }
    return '-';
});

// Custom morgan token: request body size
morgan.token('req-body-size', (req) => {
    if (req.headers['content-length']) {
        const kb = (parseInt(req.headers['content-length']) / 1024).toFixed(2);
        return `${kb}KB`;
    }
    return '-';
});

// Custom morgan token: user id from auth
morgan.token('user-id', (req) => {
    return req.user ? req.user.id : 'anonymous';
});

// Custom morgan token: request body summary (for POST/PUT/PATCH)
morgan.token('req-summary', (req) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const keys = Object.keys(req.body);
        if (keys.length > 5) {
            return `{${keys.slice(0, 5).join(',')}...+${keys.length - 5}}`;
        }
        return `{${keys.join(',')}}`;
    }
    return '-';
});

// Create a write stream that pipes into winston
const stream = {
    write: (message) => {
        // Parse the structured message from morgan
        const trimmed = message.trim();
        logger.log('http', trimmed);
    }
};

// Morgan format string: METHOD URL STATUS RESPONSE_TIME RESPONSE_SIZE REQUEST_SIZE USER
const format = ':method :url :status :response-time[0]ms | Res::res-body-size Req::req-body-size | User::user-id | Body::req-summary';

/**
 * HTTP Request Logger Middleware
 * Logs every incoming request with: method, url, status, response time,
 * response body size, request body size, user id, and request body keys.
 */
const requestLogger = morgan(format, { stream });

module.exports = requestLogger;
