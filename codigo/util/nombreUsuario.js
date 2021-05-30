module.exports = (request, response, next) => {
    response.locals.nombreUsuario = request.session.nombreU;
    response.locals.user = request.session.user;
    next();
};