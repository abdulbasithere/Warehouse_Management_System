module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.log(err);
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};