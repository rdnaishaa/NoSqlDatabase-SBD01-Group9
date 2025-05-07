const response = (res, success, status, message, payload) => {
    return res.status(status).json({
        success,
        message,
        payload,
    });
};

module.exports = response;
