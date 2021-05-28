module.exports = (request, response, next) => {
    response.locals.nombreUsuario = request.session.nombreU;
    next();
};