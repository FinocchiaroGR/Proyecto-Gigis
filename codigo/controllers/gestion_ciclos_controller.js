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
    const error = request.session.error === undefined ? 'false' : request.session.error;
    const bandera = request.session.bandera === undefined ? 'false' : request.session.bandera;
    request.session.estadogc = request.session.error === undefined ? 'false' : request.session.error;
    let idlastCiclo = parseInt(request.session.idlastciclo) + 1;
    const idciclop =  request.session.idcicloparam === undefined ? idlastCiclo : request.session.idcicloparam;
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
                            bandera: bandera,
                            terapeutas: terapeutas,
                            programas: programas,
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
                    Participantes_Grupos_Objetivos.fetchIncritos(request.body.idGrupo,request.body.login)
                        .then(([inscritos, fieldData]) => {
                            return response.status(200).json({
                                niveles: niveles, 
                                usuarios: usuarios,
                                inscritos: inscritos
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
    Objetivo.objetivosPorNivel(request.body.idNivelObj)
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
    
};

exports.getAgrCiclo = (request,response,next) => {
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
                                                               
                            }).catch( err => {
                                console.log(err); 
                                request.session.error = "No se pudieron asignar los grupos correctamente.";
                            });
                    }
                    if(tsize=== parseInt(t) && psize === parseInt(p)){
                        request.session.error = undefined; 
                        request.session.bandera =true;
                        return response.status(300).json({ciclo: ciclo});
                    }
                }
            }
        }).catch( err => {
            request.session.bandera =true;
            request.session.error = "El ciclo no se pudo registrar correctamente.";
            return response.status(300).json({message: ""});
        });
};


exports.postPerfilCiclo = (request,response,next) => {
    request.session.idcicloparam = parseInt(request.body.idcicloparam); 
    request.session.error = undefined; 
    request.session.bandera =undefined;
    return response.status(300).json();

};

exports.get = (request,response,next) => {
    const estado = request.session.estadogc === undefined ? 'vacio' : request.session.estadogc;
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
                                    a_pasados:a_pasados,
                                    ciclos_aactual: ciclos_aactual,
                                    mes: mes,
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
    request.session.estadogc = undefined;
};
