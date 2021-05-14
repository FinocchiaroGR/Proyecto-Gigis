const Arrow = require('../models/arrow');
const Usuario = require('../models/usuarios');
const Terapeuta = require('../models/terapeutas');
const Usuario_Rol = require('../models/usuarios_roles');
const Rol = require('../models/roles');
const Func = require('../models/funciones');
const Rol_Func = require('../models/roles_funciones');
const { fetchId } = require('../models/roles');

const arrows = Arrow.fetchAll();

exports.get = (request, response, next) => {
    const error = request.session.error === undefined ? false : request.session.error;
    const bandera = request.session.bandera === undefined ? false : request.session.bandera;
    Usuario.fetchListaSin('participante')
        .then(([usuarios, fieldData1]) => {
            Rol.fetchAll()
                .then(([roles, fieldData2]) => {
                    Func.fetchAll()
                        .then(([func]) => {
                            response.render('gestion_usuarios', {
                                usuarios: usuarios, 
                                roles: roles,
                                func: func,
                                error: error,
                                bandera: bandera,
                                tituloDeHeader: "Gestión de usuarios",
                                tituloBarra: "Usuarios",
                                backArrow: {display: 'block', link: '/gestionAdmin'},
                                forwArrow: arrows[1]
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            Request.session.error = 'Error de comunicacion con el Servidor'
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    request.session.error = undefined;
    request.session.bandera =undefined;
};
    
exports.postNuevoUsuario = (request,response,next) => {
    let apellidoP = request.body.apellidoP === ''? null :  request.body.apellidoP;
    let apellidoM = request.body.apellidoM === ''? null :  request.body.apellidoM;
    const usuario = new Usuario(request.body.correo, request.body.contra, request.body.nombre, apellidoP, apellidoM);
    usuario.save()
        .then(() => {
            for (let rol of request.body.selRol){
                let usuario_rol = new Usuario_Rol(request.body.correo, rol);
                usuario_rol.save()
                    .then(() => {
                        if (rol === '2'){ 
                            const cv_path  = request.file.path === ''? null :  request.file.path;
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
            request.session.error = undefined;
            request.session.bandera = true; 
            response.redirect('/gestionAdmin/gestionUsuarios/');
        }).catch( err => {
            console.log(err);
            request.session.error = "Ya existe un usuario registrado con el correo que ingresaste.";
            request.session.bandera =true; 
            response.redirect('/gestionAdmin/gestionUsuarios');    
        });
};

exports.postNuevoRoll = (request, response, next) => {
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
        request.body.Funcion_17 === undefined ? null : 17
    ]
    for (let funcion of funciones){
        if (funcion != null){
            error = false;
        }
    }
    if(error == true){
        request.session.error = 'No hay funciones registradas';
        console.log(request.session.error);
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
                                        console.log(err);
                                    });
                            }
                        }
                    })
                    .catch( err => {
                        request.session.error = 'Error de comunicacion con el servidor';
                        console.log(err);
                        response.redirect('/gestionAdmin/gestionUsuarios');
                    });
                response.redirect('/gestionAdmin/gestionUsuarios');
            })
            .catch( err => {
                request.session.error = 'Error de comunicacion con el servidor';
                console.log(err);
                response.redirect('/gestionAdmin/gestionUsuarios');
            });
    }
};