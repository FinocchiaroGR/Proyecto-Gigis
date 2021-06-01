const Arrow = require('../models/arrow');
const Usuario = require('../models/usuarios');
const Participante = require('../models/participantes');
const Usuario_Rol = require('../models/usuarios_roles');
const Rol = require('../models/roles');
const Participantes_Grupos_Objetivos = require('../models/participantes_grupos_objetivos');
const arrows = Arrow.fetchAll();

exports.postModPar = ((request,response,next) => {
    Participante.fetchOneUsuarioParticipante(request.body.login)
        .then(([participante]) => {
            return response.status(200).json({
                participante : participante
            })
        })
        .catch((err) => {
            console.log(err);
        })
});

exports.postUpdatePar = ((request , response) => {
    let login = request.body.login;
    let oldEmail = request.body.oldEmail;
    let nombre = request.body.nombre;
    let sex = request.body.selectSex;
    let date = request.body.bDay;
    let status = request.body.estatusSelect;
    let password = request.body.password === '' ? null : request.body.password;
    let apellidoP = request.body.apellidoP === '' ? null : request.body.apellidoP;
    let apellidoM = request.body.apellidoM === '' ? null : request.body.apellidoM;
    let tel = request.body.tel === '' ? null : request.body.tel;

    if (password != null) {
        Usuario.actualizarPassword(password, oldEmail)
            .catch((err) => {
                console.log(err);
            })
    }

    Usuario.updateUser(login, nombre, apellidoP, apellidoM, oldEmail)
        .then(() => {
            Participante.updateParticipante(status, sex, date, tel, login)
                .then(() => {
                    request.session.mensaje = 'El participante fue actualizado correctamente';
                    request.session.bandera = false; 
                    response.redirect('/gestionAdmin/gestionParticipantes');
                })
        })
        .catch((err) => {
            console.log(err);
            request.session.mensaje = 'Ya existe un participante registrado con el correo que ingresaste';
            request.session.bandera = true; 
            response.redirect('/gestionAdmin/gestionParticipantes');
        })
});

exports.deleteParticipante = (request, response) => {
    let login = request.body.login;

    Participantes_Grupos_Objetivos.fetchIfParticipanteHaveGroups(login)
        .then(([numGrupos]) => {
            if (numGrupos[0].num_groups == 0) {
                Participante.deleteById(login)
                    .then(() => {
                        Usuario.deleteById(login)
                            .then(() => {
                                request.session.mensaje = 'El participante fue eliminado';
                                request.session.bandera = false; 
                                response.redirect('/gestionAdmin/gestionParticipantes');
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
                Participante.changeStatusToB(login)
                    .then(() => {
                        let timestamp = new Date().getUTCMilliseconds();
                        Usuario.changeLogin(login, timestamp)
                            .then(() => {
                                request.session.mensaje = 'El participante fue eliminado';
                                request.session.bandera = false; 
                                response.redirect('/gestionAdmin/gestionParticipantes');
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
};

exports.getPerfilPartic = ((request,response,next) => {
    response.render('perfil_participante', {
        tituloDeHeader: "Perfil participante",
        tituloBarra: "Adriana Guadalupe",
        backArrow: {display: 'block', link: '/gestionAdmin/gestionParticipantes'},
        forwArrow: arrows[1]
    });
});

exports.getBuscar  = (request, response, next) => {
    Participante.fetchPorCriterio(request.params.criterio)
        .then(([participantes, fieldData]) => {
            return response.status(200).json({
                participantes: participantes
            });
        })   
        .catch(err => {
            console.log(err)
        });
  }

exports.get = ((request,response,next) => {
    const mensaje = request.session.mensaje === undefined ? undefined : request.session.mensaje;
    const bandera = request.session.bandera === undefined ? undefined : request.session.bandera;
    const permisos = request.session.permisos;
    const permisoGestionUsuarios = permisos.includes(20) || permisos.includes(6);
    if(permisoGestionUsuarios) {
        Participante.fetchAll('participante')
            .then(([participantes, fieldData1]) => {
                response.render('gestion_participantes', {
                    participantes: participantes,
                    bandera : bandera,
                    mensaje : mensaje,
                    permisos: request.session.permisos,
                    tituloDeHeader: "Gestión de participantes",
                    tituloBarra: "Participantes",
                    backArrow: {display: 'block', link: '/gestionAdmin'},
                    forwArrow: arrows[1]
                });
            })
            .catch((err) => console.log(err));
        }
        else {
            response.status(404);
            response.send('Lo sentimos, este sitio no existe');
        }
    request.session.mensaje = undefined;
    request.session.bandera = undefined;
});

exports.post = ((request,response,next) => {
    let apellidoP = request.body.apellidoP === ''? null :  request.body.apellidoP;
    let apellidoM = request.body.apellidoM === ''? null :  request.body.apellidoM;
    let tel = request.body.tel === ''? null :  request.body.tel;
    const participante = new Participante(request.body.correo, 'asdfg1234', request.body.nombre, apellidoP, apellidoM, 'A', request.body.sexo, request.body.fechaN, tel);
    participante.save()
        .then(() => {
            const usuario_rol = new Usuario_Rol(request.body.correo, '1');
            usuario_rol.save()
                .then(() => {      
                    request.session.mensaje = 'El participante fue registrado correctamente';
                    request.session.bandera = false; 
                    response.redirect('/gestionAdmin/gestionParticipantes')
                }).catch( err => {
                    console.log("err1");
                    console.log(err);
                    request.session.mensaje = "Ya existe un participante registrado con el correo que ingresaste.";
                    request.session.bandera = true; 
                    response.redirect('/gestionAdmin/gestionParticipantes');  
                });
        }).catch( err => {
            console.log(err);  
        });
});

exports.getPerfil = (request, response) => {
    Usuario.fetchOne(request.params.login)
        .then(([usuario]) => {
            Rol.fetchRolNameByLogin(request.params.login)
                .then(([roles]) => {
                    response.render('perfil_usuario', {
                        usuario: usuario,
                        roles : roles,
                        permisos: request.session.permisos,
                        tituloDeHeader: "Perfil de participante",
                        tituloBarra: "Perfil",
                        backArrow: {display: 'block', link: '/gestionAdmin/gestionParticipantes'},
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