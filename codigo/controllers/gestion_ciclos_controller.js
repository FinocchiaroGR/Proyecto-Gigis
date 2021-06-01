const Arrow = require('../models/arrow');
const Ciclo = require('../models/ciclos');
const Programa = require('../models/programas');
const Nivel = require('../models/niveles');
const Usuario = require('../models/usuarios');
const Participante = require('../models/participantes');
const Grupo = require('../models/grupos');
const Objetivo = require('../models/objetivos');
const Participantes_Grupos_Objetivos = require('../models/participantes_grupos_objetivos');

const arrows = Arrow.fetchAll();
const mes = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril', 
    'Mayo',
    'Junio',
    'Julio', 
    'Agosto',
    'Septiembre', 
    'Octubre', 
    'Noviembre',
    'Diciembre'
];

const abvMes = [
    'Ene',
    'Feb',
    'Mar',
    'Abr', 
    'May',
    'Jun',
    'Jul', 
    'Ago',
    'Sep', 
    'Oct', 
    'Nov',
    'Dic',
];

exports.getInscribir = (request,response,next) => {
    const usuario = request.session.user;
    const error = request.session.error === undefined ? 'false' : request.session.error;
    const bandera = request.session.bandera === undefined ? 'false' : request.session.bandera;
    request.session.estadogc = request.session.error === undefined ? 'false' : request.session.error;
    //el id del ciclo si fue agregado recientemente
    const idlastCiclo = parseInt(request.session.idlastciclo) + 1;
    //el id del ciclo dependiendo si viene de agregar o de la lista
    const idciclop =  request.params.idCiclo === undefined ? idlastCiclo : request.params.idCiclo;
    //el id del ultimo ciclo
    let idlastciclop = request.params.idCiclo === undefined ? idlastCiclo: request.session.idlastciclo;
    Ciclo.fetchUnoPorId(idciclop)
    .then(([ciclo, fieldData1]) => {
        let meses = ciclo[0].fechaFinal.getMonth() === ciclo[0].fechaInicial.getMonth() ? mes[ciclo[0].fechaInicial.getMonth()] : abvMes[ciclo[0].fechaInicial.getMonth()] + '-'+ abvMes[ciclo[0].fechaFinal.getMonth()];
        let encabezado = 'Ciclo ' + meses + ' '+ ciclo[0].fechaInicial.getFullYear();
        Grupo.fetchGPorIdCiclo(idciclop)
            .then(([terapeutas, fieldData1]) => {
                Programa.fetchPorIdCiclo(idciclop)
                    .then(([programas, fieldData1]) => {
                        response.render('gc_inscribir', {
                            error: error,
                            idciclo: idciclop,
                            idlastciclop: idlastciclop,
                            usuario: usuario,
                            bandera: bandera,
                            terapeutas: terapeutas,
                            programas: programas,
                            permisos: request.session.permisos,
                            tituloDeHeader: "Inscripciones",
                            tituloBarra: encabezado,
                            backArrow: {display: 'block', link: '/gestionAdmin/gestionCiclos'},
                            forwArrow: arrows[1]
                        })
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }).catch((err) => console.log(err)); 
    request.session.error = undefined;
    request.session.bandera =undefined;
};

exports.getInsPar = (request,response,next) => {
    request.session.grupoinscripcion = request.params.idGrupo;
    const permisos = request.session.permisos;
    if(permisos.includes(4)) {
        Participante.fetchActivos()
            .then(([participantes, fieldData1]) => {
                Participantes_Grupos_Objetivos.fetchLoginIncritos(request.params.idGrupo)
                    .then(([inscritos, fieldData]) => {
                        return response.status(200).json({
                            participantes: participantes,
                            inscritos: inscritos
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
};

exports.getBuscarPar = (request,response,next) => {
    Participante.fetchPorCriterio(request.params.criterio)
        .then(([participante, fieldData]) => {
            Participantes_Grupos_Objetivos.fetchLoginIncritos(request.session.grupoinscripcion)
                .then(([inscritos, fieldData]) => {
                    return response.status(200).json({
                        participante: participante,
                        inscritos: inscritos
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch(err => {
            console.log(err)
        });
};

exports.postSelectNivel = (request,response,next) => {
    Nivel.fetchPorIdGrupo(request.body.idGrupo)
        .then(([niveles, fieldData]) => {
            Usuario.fetchNombre(request.body.login)
                .then(([usuarios, fieldData]) => {
                    Participantes_Grupos_Objetivos.fetchIncrito(request.body.idGrupo,request.body.login)
                        .then(([inscrito, fieldData]) => {
                            return response.status(200).json({
                                niveles: niveles, 
                                usuarios: usuarios,
                                inscrito: inscrito
                            });
                        })
                        .catch(err => {
                            console.log(err)
                        });
                })
                .catch(err => {
                    console.log(err)
                });
        })
        .catch(err => {
            console.log(err)
        });
};

exports.postMostrarObj = (request,response,next) => {
    Objetivo.objetivosPorNivelInscritos(request.body.idNivelObj, request.body.login, request.body.idGrupo)
        .then(([objetivos, fieldData]) => {
            return response.status(200).json({
                objetivos: objetivos
            });
        })
        .catch(err => {
            console.log(err)
        });
};

exports.postInscribir = (request,response,next) => {
    request.session.error = undefined;
    Objetivo.deleteObj(request.body.objetivos[0].login, request.body.objetivos[0].idGrupo)
        .then(() => {
            for (let participante of request.body.objetivos){
                let PGO = new Participantes_Grupos_Objetivos(participante.login, participante.idGrupo,participante.idNivel, participante.idObjetivo);
                PGO.save()
                .then(() =>{
                }).catch((err) => {
                    console.log(err);
                    request.session.error = 'No se pudo inscribir correctamente al participante.';
                    return response.status(500).json({message: "Internal Server Error"});
                })
            }
        })
        .catch( err => {
            request.session.error = 'No se pudo inscribir correctamente al participante.';
            response.redirect('/gestionAdmin/gestionCiclos');
            console.log(err);
        });
      Usuario.fetchNombre(request.body.objetivos[0].login)
        .then(([nombre,fieldData]) => {
          return response.status(200).json({
            nombre: nombre,
            grupo: request.body.objetivos[0].idGrupo,
            error: request.session.error
          });
        }).catch((err) => {
            console.log(err);
            return response.status(500).json({message: "Internal Server Error"});
        })
      
};

exports.postBaja = (request,response,next) => {
    request.session.error = undefined;
    Objetivo.deleteObj(request.body.login, request.body.idGrupo)
        .then(() => {
            Usuario.fetchNombre(request.body.login)
            .then(([nombre,fieldData]) => {
              return response.status(200).json({
                nombre: nombre,
                grupo: request.body.idGrupo,
                error: request.session.error
              });
            }).catch((err) => {
                console.log(err);
                return response.status(500).json({message: "Error el servidor."});
            })
        })
        .catch( err => {
            request.session.error = 'No se pudo inscribir correctamente al participante.';
            response.redirect('/gestionAdmin/gestionCiclos');
            console.log(err);
        });
      
};

exports.getAgrCiclo = (request,response,next) => {
    const permisos = request.session.permisos;
    if(permisos.includes(4)) {
        request.session.idcicloparam =undefined;
        Programa.fetchAll()
        .then(([programas, fieldData1]) => {
            Usuario.fetchNomTerapeutas()
            .then(([terapeutas, fieldData1]) => {
                Ciclo.fetchFechaFinalUltimoCiclo()
                .then(([fechaLimite, fieldData1]) => {
                    Grupo.fetchIdUltimoGrupo()
                        .then(([idUltimoGrupo, fieldData1]) => {
                        request.session.idlastgrupo =  idUltimoGrupo[0].idlastgrupo;  
                        response.render('gc_agregar_ciclo', {
                            fechaLimite: fechaLimite,
                            programas: programas,
                            terapeutas: terapeutas,
                            permisos: request.session.permisos,
                            tituloDeHeader: "Nuevo ciclo",
                            tituloBarra: "Nuevo ciclo",
                            backArrow: {display: 'block', link: '/gestionAdmin/gestionCiclos'},
                            forwArrow: arrows[1]
                        });
                        })
                        .catch(err => console.log(err)); 
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }
    else {
        response.status(404);
        response.send('Lo sentimos, este sitio no existe');
    }
};

exports.postAgrCiclo= (request,response,next) => {
    let idCiclo = parseInt(request.session.idlastciclo) + 1;
    let idGrupo =  parseInt(request.session.idlastgrupo); 
    const ciclo = new Ciclo(idCiclo,request.body.fechaInicial, request.body.fechaFinal);
    let psize = Object.keys(request.body.prograsSel).length-1;
    let tsize = Object.keys(request.body.terapAsig).length-1;
    ciclo.save()
        .then(() => {
            for (let p in request.body.prograsSel){
                let idPrograma = request.body.prograsSel[p];
                for (let t in request.body.terapAsig){
                    let idProgAsig = request.body.terapAsig[t][0].idPrograma;
                    let login = request.body.terapAsig[t][0].login.toString();
                    if (idPrograma === idProgAsig){
                        let numeroGrupo =  parseInt(t) + 1;
                        idGrupo += 1;  
                        let grupo = new Grupo(idGrupo,numeroGrupo, idPrograma, idCiclo,login);
                        grupo.save()
                            .then(() => {
                                if(tsize=== parseInt(t) && psize === parseInt(p)){
                                    request.session.error = undefined; 
                                    request.session.bandera =true;
                                    return response.status(300).json({ciclo: ciclo});
                                }                                                               
                            }).catch( err => {
                                console.log(err); 
                                request.session.error = "No se pudieron asignar los grupos correctamente.";
                            });
                    }
                }
            }
        }).catch( err => {
            request.session.bandera =true;
            request.session.error = "El ciclo no se pudo registrar correctamente.";
            return response.status(300).json({message: ""});
        });
};


exports.getPerfilCiclo = (request,response,next) => {
    response.render('perfil_usuario',{
        permisos:request.session.permisos,
        tituloDeHeader: "Gestión de ciclos",
        tituloBarra: "Ciclos",
        backArrow: {display: 'block', link: '/gestionAdmin/gestionCiclos'},
        forwArrow: arrows[1]
    });

};

exports.getEditarCiclo = (request,response,next) => {
    const permisos = request.session.permisos;
    if(permisos.includes(11)) {
        Ciclo.fetchFechaFinalUltimoCicloSinContar(request.params.idCiclo)
        .then(([fechaLimite, fieldData1]) => {
            Ciclo.fetchUnoPorId(request.params.idCiclo)
                .then(([ciclo, fieldData1]) => {
                    let meses = ciclo[0].fechaFinal.getMonth() === ciclo[0].fechaInicial.getMonth() ? mes[ciclo[0].fechaInicial.getMonth()] : abvMes[ciclo[0].fechaInicial.getMonth()] + '-'+ abvMes[ciclo[0].fechaFinal.getMonth()];
                    let ciclonombre = meses + ' '+ ciclo[0].fechaInicial.getFullYear(); 
                    return response.status(200).json({
                        fechaLimite: fechaLimite,
                        permisos: request.session.permisos,
                        ciclonombre: ciclonombre,
                        ciclo:ciclo,
                    });
                })
                .catch((err) => console.log(err));
        })               
        .catch(err => console.log(err));
    }
    else {
        response.status(404);
        response.send('Lo sentimos, este sitio no existe');
    }
};


exports.postEditarCiclo = (request,response,next) => {
    request.session.error = undefined;
    Ciclo.actualizar(request.body.idCiclo, request.body.fechaInicial, request.body.fechaFinal)
        .then(() => {
            Ciclo.fetchUnoPorId(request.body.idCiclo)
                .then(([ciclo, fieldData1]) => {
                    let meses = ciclo[0].fechaFinal.getMonth() === ciclo[0].fechaInicial.getMonth() ? mes[ciclo[0].fechaInicial.getMonth()] : abvMes[ciclo[0].fechaInicial.getMonth()] + '-'+ abvMes[ciclo[0].fechaFinal.getMonth()];
                    let ciclonombre = meses + ' '+ ciclo[0].fechaInicial.getFullYear(); 
                    return response.status(200).json({
                        error: request.session.error,
                        ciclonombre: ciclonombre
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch( err => {
            request.session.error = 'No se pudo inscribir correctamente al participante.';
            response.redirect('/gestionAdmin/gestionCiclos');
            console.log(err);
        });
};

exports.get = (request,response,next) => {
    const estado = request.session.estadogc === undefined ? 'vacio' : request.session.estadogc;
    const permisos = request.session.permisos;
    const permisoGestionCiclos = permisos.includes(3) || permisos.includes(4) || permisos.includes(11);
    if(permisoGestionCiclos) { 
        Ciclo.fetchIdUltimo()
            .then(([idUltimoCiclo, fieldData1]) => {
                request.session.idlastciclo = idUltimoCiclo[0].idCiclo;
                Ciclo.fetchAll()
                .then(([ciclos, fieldData1]) => {
                    Ciclo.fetchCiclosAnioActual()
                        .then(([ciclos_aactual, fieldData1]) => {
                            Ciclo.fetchAniosPasados()
                                .then(([a_pasados, fieldData1]) => {
                                    response.render('gestion_ciclos', {
                                        estado: estado,
                                        ciclos: ciclos,
                                        idUltimoCiclo: idUltimoCiclo[0].idCiclo,
                                        a_pasados:a_pasados,
                                        ciclos_aactual: ciclos_aactual,
                                        mes: mes,
                                        permisos: request.session.permisos,
                                        tituloDeHeader: "Gestión de ciclos",
                                        tituloBarra: "Ciclos",
                                        backArrow: {display: 'block', link: '/gestionAdmin'},
                                        forwArrow: arrows[1]
                                    });
                                })
                                .catch((err) => console.log(err));
                        })
                        .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
            }).catch( err => {
                console.log(err);  
            }); 
    }
    else {
        response.status(404);
        response.send('Lo sentimos, este sitio no existe');
    }
    request.session.estadogc = undefined;
};
