const Usuario = require('../models/usuarios');
const Arrow = require('../models/arrow');
const bcrypt = require('bcryptjs');
const arrows = Arrow.fetchAll();


exports.logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/usuarios/login'); //Este código se ejecuta cuando la sesión se elimina.
    });
};

exports.getlogin = (request, response, next) => {
    response.render('login', {
        tituloDeHeader: 'Ingresar',
        link: "https://dsagr.org/wp-content/uploads/2016/03/iStock_000066042813_Full.jpg",
        error: request.session.error === undefined ? false : request.session.error,
        imagen: '/media/gigis_logo_escrito.png'
    });
};

exports.postlogin = (request, response, next) => {
    
    request.session.error = undefined;

    Usuario.fetchOne(request.body.username)
        .then(([rows]) => {
            bcrypt.compare(request.body.password, rows[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        request.session.isLoggedIn = true;
                        request.session.user = rows[0].login;
                        return request.session.save(err => {
                            response.redirect('/gestionAdmin');
                        });
                    }
                    request.session.error = 'Usuario y/o contraseña incorrectos';
                    response.redirect('login');
                }).catch(err => {
                    request.session.error = 'Usuario y/o contraseña incorrectos';
                    response.redirect('login');
                });
        })
        .catch(err => {
            console.log(err);
            request.session.error = 'Usuario y/o contraseña incorrectos';
            response.redirect('login');
        });
};

exports.cambiarContraseña = (request, response, next) => {
    const error = request.session.error === undefined ? false : request.session.error;
    response.render('cambiar_contraseña', {
        tituloDeHeader: 'Cambiar contraseña',
        tituloBarra: 'Cambiar Contraseña',
        error: error,
        backArrow: { display: 'none', link: '/programas' },
        forwArrow: arrows[0]
    });
    request.session.error = undefined;
    request.session.registro_exitoso = undefined;
};

exports.postCambiarContraseña = (request, response, next) => {
    request.session.error = undefined;

    Usuario.fetchOne(request.session.user)
        .then(([rows]) => {
            bcrypt.compare(request.body.antigua, rows[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        if (request.body.nueva === request.body.confirmacion){
                            Usuario.actualizarPassword(request.body.nueva, request.session.user)
                                .then(() => {
                                    return request.session.save(err => {
                                        response.redirect('/usuarios/logout');
                                    });
                                }).catch(err => {
                                    console.log(err);
                                });
                        } else {
                            request.session.error = 'Error: Verifica que las nuevas contraseñas coincidan';
                            response.redirect('/usuarios/password');
                        }
                    } else {
                        request.session.error = 'Contraseña antigua incorrecta';
                        response.redirect('/usuarios/password');
                    }
                }).catch(err => {
                    response.redirect('/usuarios/password');
                });
        })
        .catch(err => {
            console.log(err);
            request.session.error = 'Vuelve a iniciar sesión antes de cambiar la contraseña';
            response.redirect('/usuarios/password');
        });
};