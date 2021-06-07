const Arrow = require('../models/arrow');
const Usuario = require('../models/usuarios');
const Terapeuta = require('../models/terapeutas');
const Usuario_Rol = require('../models/usuarios_roles');
const Rol = require('../models/roles');
const Func = require('../models/funciones');
const Rol_Func = require('../models/roles_funciones');
const Grupos_Terapeutas = require('../models/grupos_terapeutas');
const { request, response } = require('express');

const arrows = Arrow.fetchAll();

exports.get = (request, response) => {
    const mensaje = request.session.mensaje === undefined ? undefined : request.session.mensaje;
    const bandera = request.session.bandera === undefined ? undefined : request.session.bandera;
    const windowM = request.session.windowM === undefined ? undefined : request.session.windowM;
    const banderaW = request.session.banderaW === undefined ? undefined : request.session.banderaW;
    const permisos = request.session.permisos;
    const permisoGestionUsuarios = permisos.includes(8) || permisos.includes(9) || permisos.includes(10) || permisos.includes(12) || permisos.includes(13) || permisos.includes(17);
    if(permisoGestionUsuarios) { 
        Usuario.fetchListaSin('participante')
            .then(([usuarios]) => {
                Rol.fetchAll()
                    .then(([roles]) => {
                        Func.fetchAll()
                            .then(([func]) => {
                                response.render('gestion_usuarios', {
                                    usuarios: usuarios, 
                                    roles: roles,
                                    func: func,
                                    mensaje: mensaje,
                                    bandera: bandera,
                                    windowM: windowM,
                                    banderaW: banderaW,
                                    permisos: request.session.permisos,
                                    tituloDeHeader: "Gestión de usuarios",
                                    tituloBarra: "Usuarios",
                                    backArrow: {display: 'block', link: '/gestionAdmin'},
                                    forwArrow: arrows[1]
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                request.session.mensaje = 'Error de comunicacion con el Servidor'
                        });
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }
    else {
        response.status(404);
        response.send('Lo sentimos, este sitio no existe');
    }
    request.session.mensaje = undefined;
    request.session.bandera = undefined;
    request.session.windowM = undefined;
    request.session.banderaW = undefined; 
};


exports.getBuscar  = (request, response, next) => {
    Usuario.fetchPorCriterio(request.params.criterio)
      .then(([usuarios,fieldData]) => {
            return response.status(200).json({
              usuarios:usuarios,
            });
      }).catch((err) => {
        console.log(err);
      });
  }
    
exports.postNuevoUsuario = (request,response) => {
    let apellidoP = request.body.apellidoP === ''? null :  request.body.apellidoP;
    let apellidoM = request.body.apellidoM === ''? null :  request.body.apellidoM;
    const usuario = new Usuario(request.body.correo, request.body.password, request.body.nombre, apellidoP, apellidoM);
    usuario.save()
        .then(() => {
            for (let rol of request.body.selRol){
                let usuario_rol = new Usuario_Rol(request.body.correo, rol);
                usuario_rol.save()
                    .then(() => {
                        if (rol === '2'){ 
                            const cv_path  = request.file === undefined ? null :  request.file.path;
                            const titulo = request.body.titulo === ''? null :  request.body.titulo;
                            const terapeuta = new Terapeuta(request.body.correo, titulo,  cv_path, 'A');
                            terapeuta.save()
                                .then(() => {
                                }).catch( err => {
                                    console.log(err);
                                    response.redirect('/gestionAdmin/');    
                                }); 
                        }             
                    }).catch( err => {
                        console.log(err);
                        response.redirect('/gestionAdmin/');    
                    });
            }
            request.session.mensaje = 'El usuario fue creado correctamente';
            request.session.bandera = false; 
            response.redirect('/gestionAdmin/gestionUsuarios/');
        }).catch( err => {
            console.log(err);
            request.session.mensaje = "Ya existe un usuario registrado con el correo que ingresaste";
            request.session.bandera = true; 
            response.redirect('/gestionAdmin/gestionUsuarios');    
        });
};

exports.postNuevoRoll = (request, response) => {
    let error = true;
    let funciones = [
        request.body.Funcion_1 === undefined ? null : 1,
        request.body.Funcion_2 === undefined ? null : 2,
        request.body.Funcion_3 === undefined ? null : 3,
        request.body.Funcion_4 === undefined ? null : 4,
        request.body.Funcion_5 === undefined ? null : 5,
        request.body.Funcion_6 === undefined ? null : 6,
        request.body.Funcion_7 === undefined ? null : 7,
        request.body.Funcion_8 === undefined ? null : 8,
        request.body.Funcion_9 === undefined ? null : 9,
        request.body.Funcion_10 === undefined ? null : 10,
        request.body.Funcion_11 === undefined ? null : 11,
        request.body.Funcion_12 === undefined ? null : 12,
        request.body.Funcion_13 === undefined ? null : 13,
        request.body.Funcion_14 === undefined ? null : 14,
        request.body.Funcion_15 === undefined ? null : 15,
        request.body.Funcion_16 === undefined ? null : 16,
        request.body.Funcion_17 === undefined ? null : 17,
        request.body.Funcion_18 === undefined ? null : 18,
        request.body.Funcion_19 === undefined ? null : 19,
        request.body.Funcion_20 === undefined ? null : 20,
        request.body.Funcion_21 === undefined ? null : 21
    ]
    for (let funcion of funciones){
        if (funcion != null){
            error = false;
        }
    }
    if(error == true){
        request.session.mensaje = 'No hay funciones registradas';
        request.session.bandera = true; 
        response.redirect('/gestionAdmin/gestionUsuarios');
    }
    else
    {
        let nombreRol = request.body.nombreRol;
        const rol = new Rol(nombreRol);
        rol.save()
            .then(() => {
                Rol.fetchId(nombreRol)
                    .then(([idRol]) => {
                        for (let idfuncion of funciones){
                            if (idfuncion != null){
                                const add = new Rol_Func(idRol[0].idRol, idfuncion);
                                add.save()
                                    .catch(err => {
                                        request.session.mensaje = 'Error de comunicacion con el servidor';
                                        request.session.bandera = true; 
                                        response.redirect('/gestionAdmin/gestionUsuarios');
                                        console.log(err);
                                    });
                            }
                        }
                        request.session.mensaje = 'El rol fue creado correctamente';
                        request.session.bandera = false;
                        response.redirect('/gestionAdmin/gestionUsuarios');
                    })
                    .catch( err => {
                        request.session.mensaje = 'Error de comunicacion con el servidor';
                        request.session.bandera = true;
                        console.log(err);
                    });
            })
            .catch( err => {
                request.session.mensaje = 'Error de comunicacion con el servidor';
                request.session.bandera = true; 
                response.redirect('/gestionAdmin/gestionUsuarios');
                console.log(err);
            });
    }
};

exports.postModRoll = (request, response) => {
    Rol_Func.fetchJoin(request.body.idRol)
        .then(([funciones]) => {
            return response.status(200).json({
                funciones : funciones,
                idRol : request.body.idRol
            });
        })
        .catch((err) => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/gestionAdmin/gestionUsuarios');
            console.log(err); 
        });
};

exports.postUpdateRoll = (request, response) => {
    const idRol = request.body.idRol;

    let funciones = [
        request.body.Funcion_1 === undefined ? null : 1,
        request.body.Funcion_2 === undefined ? null : 2,
        request.body.Funcion_3 === undefined ? null : 3,
        request.body.Funcion_4 === undefined ? null : 4,
        request.body.Funcion_5 === undefined ? null : 5,
        request.body.Funcion_6 === undefined ? null : 6,
        request.body.Funcion_7 === undefined ? null : 7,
        request.body.Funcion_8 === undefined ? null : 8,
        request.body.Funcion_9 === undefined ? null : 9,
        request.body.Funcion_10 === undefined ? null : 10,
        request.body.Funcion_11 === undefined ? null : 11,
        request.body.Funcion_12 === undefined ? null : 12,
        request.body.Funcion_13 === undefined ? null : 13,
        request.body.Funcion_14 === undefined ? null : 14,
        request.body.Funcion_15 === undefined ? null : 15,
        request.body.Funcion_16 === undefined ? null : 16,
        request.body.Funcion_17 === undefined ? null : 17,
        request.body.Funcion_18 === undefined ? null : 18,
        request.body.Funcion_19 === undefined ? null : 19,
        request.body.Funcion_20 === undefined ? null : 20,
        request.body.Funcion_21 === undefined ? null : 21
    ]

    Rol_Func.deleteById(idRol)
        .then(() => {
            for (let idfuncion of funciones){
                if (idfuncion != null){
                    const add = new Rol_Func(idRol, idfuncion);
                    add.save()
                        .catch( err => {
                            request.session.mensaje = 'Error de comunicacion con el servidor';
                            request.session.bandera = true;
                            response.redirect('/gestionAdmin/gestionUsuarios');
                            console.log(err);
                        });
                }
            }
            request.session.mensaje = 'El rol fue actualizado correctamente';
            request.session.bandera = false; 
            response.redirect('/gestionAdmin/gestionUsuarios');
        })
        .catch( err => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/gestionAdmin/gestionUsuarios');
            console.log(err);
        });
};
 
exports.postModUser = (request, response) => {
    let tBool = false;
    Usuario.fetchOneUsuarioTerapeuta(request.body.login)
        .then(([usuarios]) => {
            for(let usuario of usuarios){
                if(usuario.idRol == 2){
                    tBool = true;
                }
            }
            Rol.fetchAllRolsByLogin(request.body.login)
                .then(([roles]) => {
                    if (tBool == true){
                        Terapeuta.fetchById(request.body.login)
                            .then(([terapeuta]) => {
                                return response.status(200).json({
                                    usuarios : usuarios,
                                    roles : roles,
                                    terapeuta : terapeuta,
                                    tBool : tBool,
                                    permisos: request.session.permisos
                                })
                            })
                            .catch((err) => {
                                request.session.mensaje = 'Error de comunicacion con el servidor';
                                request.session.bandera = true;
                                response.redirect('/gestionAdmin/gestionUsuarios');
                                console.log(err);
                            });
                    }
                    else {
                        return response.status(200).json({
                            usuarios : usuarios,
                            roles : roles,
                            tBool : tBool,
                            permisos: request.session.permisos
                        });
                    }
                })
                .catch((err) => {
                    request.session.mensaje = 'Error de comunicacion con el servidor';
                    request.session.bandera = true;
                    response.redirect('/gestionAdmin/gestionUsuarios');
                    console.log(err); 
                });
        })
        .catch((err) => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/gestionAdmin/gestionUsuarios');
            console.log(err); 
        });
};

exports.postUpdateUser = (request, response) => {
    let login = request.body.login;
    let oldEmail = request.body.oldEmail;
    let nombre = request.body.nombre;
    let password = request.body.password === '' ? null : request.body.password;
    let apellidoP = request.body.apellidoP === '' ? null : request.body.apellidoP;
    let apellidoM = request.body.apellidoM === '' ? null : request.body.apellidoM;
    let lengthRoles = request.body.lengthRoles;
    let tBool = request.body.tBool === 'true' ? true : false;
    let roles = [];
    
    for (let i = 2; i <= lengthRoles; i++) {
        roles.push(request.body[`Rol_${i}`] === undefined ? null : i);
    }

    if (password != null) {
        Usuario.actualizarPassword(password, oldEmail)
        .catch((err) => {
            console.log(err);
        })
    }

    if (tBool == true && roles[0] == null) {
        Grupos_Terapeutas.fetchIfTerapeutaHaveGroups(oldEmail)
            .then(([numGrupos]) => {
                if (numGrupos[0].num_groups == 0){
                    Terapeuta.deleteById(oldEmail)
                        .then(() => {
                            Usuario_Rol.deleteById(oldEmail)
                                .then(() => {
                                    Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
                                        .then(() => {
                                            for (rol of roles){ 
                                                if (rol != null && rol != 2) {
                                                    let usuario_rol = new Usuario_Rol(login, rol);
                                                    usuario_rol.save()
                                                        .catch((err) => {
                                                            console.log(err);
                                                        })
                                                }
                                            }
                                            request.session.mensaje = 'El rol fue actualizado correctamente';
                                            request.session.bandera = false; 
                                            response.redirect('/gestionAdmin/gestionUsuarios');
                                        }).catch((err) => {
                                            console.log(err);
                                            request.session.mensaje = 'Ya existe un usuario registrado con el correo que ingresaste';
                                            request.session.bandera = true; 
                                            response.redirect('/gestionAdmin/gestionParticipantes');
                                        })
                                }).catch((err) => {
                                    console.log(err);
                                })
                            
                        }).catch((err) => {
                            console.log(err);
                        })
                }
                else {
                    Terapeuta.changeStatusToB(oldEmail)
                        .then(() => {
                            Usuario_Rol.deleteById(oldEmail)
                                .then(() => {
                                    Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
                                        .then(() => {
                                            for (rol of roles){ 
                                                if (rol != null) {
                                                    let usuario_rol = new Usuario_Rol(login, rol);
                                                    usuario_rol.save()
                                                        .catch((err) => {
                                                            console.log(err);
                                                        })
                                                }
                                            }
                                            let usuario_rol = new Usuario_Rol(login, 2);
                                            usuario_rol.save()
                                                .catch((err) => {
                                                    console.log(err);
                                                })
                                            request.session.windowM = 'El usuario fue actualizado exitosamente. Pero no se pudo remover el rol Terapueta porque este usuario tiene o tuvo grupos asignados.';
                                            request.session.banderaW = true;
                                            request.session.mensaje = 'El usuario fue actualizado correctamente';
                                            request.session.bandera = false; 
                                            response.redirect('/gestionAdmin/gestionUsuarios');
                                        }).catch((err) => {
                                            console.log(err);
                                            request.session.mensaje = 'Ya existe un usuario registrado con el correo que ingresaste';
                                            request.session.bandera = true; 
                                            response.redirect('/gestionAdmin/gestionParticipantes');
                                        })
                                }).catch((err) => {
                                    console.log(err);
                                })
                        }).catch((err) => {
                            console.log(err);
                        })
                }
            }).catch((err) => {
                console.log(err);
            })
    }
    else if (tBool == true && roles[0] == 2) {
        let titulo = request.body.titulo === '' ? null : request.body.titulo;
        let path = request.file === undefined ? null : request.file.path;
        let estatus = request.body.estatusSelect;
        Usuario_Rol.deleteById(oldEmail)
            .then(() => {
                Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
                    .then(() => {
                        for (rol of roles){ 
                            if (rol != null) {
                                let usuario_rol = new Usuario_Rol(login, rol);
                                usuario_rol.save()
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }
                        }
                        Terapeuta.updateTerapeuta(login,titulo,estatus)
                            .then(() => {
                                if (path != null) {
                                    Terapeuta.updateTerapeutaCv(path, login)
                                        .catch((err) => {
                                            console.log(err);
                                        })
                                }
                                request.session.mensaje = 'El usuario fue actualizado correctamente';
                                request.session.bandera = false; 
                                response.redirect('/gestionAdmin/gestionUsuarios');
                            }).catch((err) => {
                                console.log(err);
                            })
                    }).catch((err) => {
                        console.log(err);
                        request.session.mensaje = 'Ya existe un usuario registrado con el correo que ingresaste';
                        request.session.bandera = true; 
                        response.redirect('/gestionAdmin/gestionParticipantes');
                    })
            }).catch((err) => {
                console.log(err);
            })
    }
    else if (tBool == false && roles[0] == 2) {
        let titulo = request.body.titulo === '' ? null : request.body.titulo;
        let path = request.file === undefined ? null : request.file.path;
        Usuario_Rol.deleteById(oldEmail)
            .then(() => {
                Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
                    .then(() => {
                        for (rol of roles){ 
                            if (rol != null) {
                                let usuario_rol = new Usuario_Rol(login, rol);
                                usuario_rol.save()
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }
                        }
                        let terapeuta = new Terapeuta(login,titulo,path,'A');
                        terapeuta.save()
                            .then(() => {
                                request.session.mensaje = 'El usuario fue actualizado correctamente';
                                request.session.bandera = false; 
                                response.redirect('/gestionAdmin/gestionUsuarios');
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    }).catch((err) => {
                        console.log(err);
                        request.session.mensaje = 'Ya existe un usuario registrado con el correo que ingresaste';
                        request.session.bandera = true;
                        response.redirect('/gestionAdmin/gestionParticipantes');
                    })
            }).catch((err) => {
                console.log(err);
            })
    }
    else {
        Usuario_Rol.deleteById(oldEmail)
            .then(() => {
                Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
                    .then(() => {
                        for (rol of roles){ 
                            if (rol != null) {
                                let usuario_rol = new Usuario_Rol(login, rol);
                                usuario_rol.save()
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }
                        }
                        request.session.mensaje = 'El usuario fue actualizado correctamente';
                        request.session.bandera = false; 
                        response.redirect('/gestionAdmin/gestionUsuarios');
                    }).catch((err) => {
                        console.log(err);
                    })
            }).catch((err) => {
                console.log(err);
                request.session.mensaje = 'Ya existe un usuario registrado con el correo que ingresaste';
                request.session.bandera = true; 
                response.redirect('/gestionAdmin/gestionParticipantes');
            })
    }
};

exports.postDeleteUser = (request, response) => {
    let oldEmail = request.body.oldEmail2;
    let tBool = request.body.tBool2;

    if (tBool == 'true') {
        Grupos_Terapeutas.fetchIfTerapeutaHaveGroups(oldEmail)
            .then(([numGrupos]) => {
                if (numGrupos[0].num_groups == 0){
                    Terapeuta.deleteById(oldEmail)
                        .then(() => {
                            Usuario_Rol.deleteById(oldEmail)
                                .then(() => {
                                    Usuario.deleteById(oldEmail)
                                        .then(() => {
                                            request.session.mensaje = 'El usuario fue eliminado';
                                            request.session.bandera = false; 
                                            response.redirect('/gestionAdmin/gestionUsuarios');
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                        })
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
                else {
                    Usuario_Rol.deleteById(oldEmail)
                        .then(() => {
                            Terapeuta.changeStatusToB(oldEmail)
                                .then(() => {
                                    let timestamp = new Date().getUTCMilliseconds();
                                        Usuario.changeLogin(oldEmail, timestamp)
                                            .then(() => {
                                                request.session.mensaje = 'El usuario fue eliminado';
                                                request.session.bandera = false; 
                                                response.redirect('/gestionAdmin/gestionUsuarios');
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                            })
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else {
        Usuario_Rol.deleteById(oldEmail)
            .then(() => {
                Usuario.deleteById(oldEmail)
                    .then(() => {
                        request.session.mensaje = 'El usuario fue eliminado';
                        request.session.bandera = false; 
                        response.redirect('/gestionAdmin/gestionUsuarios');
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((err) => {
                console.log(err);
            })
    }
};

exports.getPerfil = (request, response) => {
    Usuario.fetchOne(request.params.login)
        .then(([usuario]) => {
            Rol.fetchRolNameByLogin(request.params.login)
                .then(([roles]) => {
                    response.render('perfil_usuario', {
                        usuario: usuario,
                        roles : roles,
                        permisos: request.session.permisos,
                        tituloDeHeader: "Perfil de usuario",
                        tituloBarra: "Perfil",
                        backArrow: {display: 'block', link: '/gestionAdmin/gestionUsuarios'},
                        forwArrow: arrows[1]
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })
};