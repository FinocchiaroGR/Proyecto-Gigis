const Usuario = require('../models/usuarios');
const Rol = require('../models/roles');
const Terapeuta = require('../models/terapeutas');
const Participante = require('../models/participantes');
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
    const permisos = request.session.permisos;
    response.render('cambiar_contraseña', {
        tituloDeHeader: 'Cambiar contraseña',
        tituloBarra: 'Cambiar Contraseña',
        error: error,
        permisos: permisos,
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

exports.getPerfil = (request, response)  => {
    let id = request.session.user;
    const permisos = request.session.permisos;
    Usuario.fetchOne(id)
        .then(([usuario]) => {
            Rol.fetchRolNameByLogin(id)
                .then(([roles]) => {
                    response.render('perfil_usuario', {
                        usuario : usuario,
                        roles : roles,
                        permisos : permisos,
                        tituloDeHeader: 'Perfil de Usuario',
                        tituloBarra: 'Perfil de Usuario',
                        backArrow: { display: 'none', link: '/programas' },
                        forwArrow: arrows[0]
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.postPerfil2 = (request, response) => {
    let login = request.body.login;
    let tBool = false;
    let pBool = false;
    Rol.fetchRolNameByLogin(login)
        .then(([roles]) => {
            console.log(roles);
            for (let rol of roles) {
                if (rol.idRol == 2){
                    tBool = true;
                    Terapeuta.fetchById(login)
                        .then(([terapeuta]) => {
                            console.log(terapeuta);
                            return response.status(200).json({
                                tBool : tBool,
                                pBool : pBool,
                                terapeuta : terapeuta
                            })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
                if (rol.idRol == 1) {
                    pBool = true;
                    Participante.fetchById(login)
                        .then(([participante]) => {
                            return response.status(200).json({
                                tBool : tBool,
                                pBool : pBool,
                                participante : participante
                            })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
                else {
                    return response.status(200);
                }
            }
        })
        .catch((err) => {
            console.log(err);
        })
};