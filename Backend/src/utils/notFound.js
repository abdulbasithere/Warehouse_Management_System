// src/middleware/notFound.js
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    error.details = {
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    };

    next(error);
};

module.exports = notFoundHandler;