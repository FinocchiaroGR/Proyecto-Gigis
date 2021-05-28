module.exports = (request, response, next) => {
    response.locals.csrfToken = request.csrfToken();
    next();
};
