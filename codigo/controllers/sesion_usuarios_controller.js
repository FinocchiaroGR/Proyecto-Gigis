const Usuario = require('../models/usuarios');
const Arrow = require('../models/arrow');
const bcrypt = require('bcryptjs');
const { permisos } = require('../models/usuarios');
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
                .then(async doMatch => {
                    if (doMatch) {
                        request.session.isLoggedIn = true;
                        request.session.user = rows[0].login;
                        let apellidoP = rows[0].apellidoPaterno != null? rows[0].apellidoPaterno : ' ';
                        let apellidoM = rows[0].apellidoMaterno != null? rows[0].apellidoMaterno : ' ';
                        request.session.nombreU = rows[0].nombreUsuario + ' ' + apellidoP + ' ' + apellidoM ;
                        request.session.permisos = [];
                        request.session.rol;
                        await Usuario.rol(rows[0].login)
                            .then(([rol,fieldData]) => {
                                request.session.rol = rol[0].idRol;
                            }).catch(err => {
                                console.log(err);                  
                            });
                        console.log(request.session.rol);
                        await Usuario.permisos(rows[0].login)
                            .then(([permisos,fieldData2]) => {
                                for (let permiso of permisos){
                                    let p = permiso.idFuncion;
                                    request.session.permisos.push(p);
                                }
                                console.log(request.session.permisos);
                            }).catch(err => {
                                console.log(err);                  
                            });
                        return response.redirect('/programas');
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