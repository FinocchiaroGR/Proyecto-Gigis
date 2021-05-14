const Arrow = require('../models/arrow');
const Ciclo = require('../models/ciclos');
const Programa = require('../models/programas')
const Usuario = require('../models/usuarios');
const Grupo = require('../models/grupos');
const Grupo_Terapeuta = require('../models/grupos_terapeutas');
const inputsCiclos = require('../models/inputsCiclos');

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
    const bandera = 'true';
    request.session.estadogc = request.session.error === undefined ? 'false' : request.session.error;
    let idlastCiclo = parseInt(request.session.idlastciclo) + 1;
    const idparam =  request.session.idcicloparam === undefined ? idlastCiclo : request.session.idcicloraram;
    console.log(idparam);
    Ciclo.fetchUnoPorId(idparam)
    .then(([ciclo, fieldData1]) => {
        let meses = ciclo[0].fechaFinal.getMonth() === ciclo[0].fechaInicial.getMonth() ? mes[ciclo[0].fechaInicial.getMonth()] : abvMes[ciclo[0].fechaInicial.getMonth()] + '-'+ abvMes[ciclo[0].fechaFinal.getMonth()];
        let encabezado = 'Ciclo ' + meses + ' '+ ciclo[0].fechaInicial.getFullYear();
        response.render('gc_inscribir', {
            error: error,
            bandera: bandera,
            tituloDeHeader: "Inscripciones",
            tituloBarra: encabezado,
            backArrow: {display: 'block', link: '/gestionAdmin/gestionCiclos'},
            forwArrow: arrows[1]
        })
    }).catch((err) => console.log(err)); 
    
    request.session.error = undefined;
    request.session.bandera =undefined;
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
                    console.log("id last grup");
                    console.log(request.session.idlastgrupo);
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
                                request.session.error = undefined;                                   
                            }).catch( err => {
                                console.log(err); 
                                request.session.error = "No se pudieron asignar los grupos correctamente.";
                            });
                    }
                }
            }
        }).catch( err => {
            console.log(err);
            request.session.error = "El ciclo no se pudo registrar correctamente.";
        });
};



exports.getPerfilCiclo = (request,response,next) => {
    response.render('gestion_perfil_ciclo', {
        programas: programas,
        tituloDeHeader: "Ciclo EM-21",
        tituloBarra: "Ciclo enero - marzo 2021",
        backArrow: {display: 'block', link: '/gestionAdmin/gestionCiclos'},
        forwArrow: arrows[1]
    });
};

exports.get = (request,response,next) => {
    const estado = request.session.estadogc === undefined ? 'vacio' : request.session.estadogc;
    Ciclo.fetchIdUltimo()
        .then(([idUltimoCiclo, fieldData1]) => {
            request.session.idlastciclo = idUltimoCiclo[0].idCiclo;
            console.log(request.session.idlastciclo);
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
