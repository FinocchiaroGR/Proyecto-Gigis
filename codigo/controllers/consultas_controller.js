const Arrow = require('../models/arrow');
const Ciclo = require('../models/ciclos');
const Programas = require('../models/programas');
const DatosConsultas = require('../models/consultasResultados');

const programasResultados = [
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    },
    {
        nombre: 'Lectura 1',
        nivel:  'looks_one',
        ciclo: 'EM2020',
        numCoincid: 13,
        numParticip: 19,
        promedio: 3.5,
        avance: 35,
        linkFoto: 'https://www.fundacionsomos.cl/wp-content/uploads/2017/05/IMG_2792-960x750.jpeg'
    }
];

const tablaUnProg = [
    {
    nombre: "Participante",
    dato: ['Edad','Sexo'],
    Periodos: ['EM-2020','AJ-2020','JO-2020','OD-2020'],
    Notas: ['Nota Inicial','Nota Final'],
    datosFin: ['Promedio','Avance']
    },
    {
    nombre: 'Adriana Guadalupe Perez Hernandez',
    dato: ['6','M'],
    Periodos: ['2.1','2.6','3.2','3.3'],
    Notas: ['2.1','3.3'],
    datosFin: ["2.7","22"]
    },
    {
    nombre: ["Isaac Carvajal Urbina"],
    dato: ["1","H"],
    Periodos: ["1","1.7","2.2","3.4"],
    Notas: ["1","3.4"],
    datosFin: ["2.1","60"]
    },
    {
    nombre: ["Dulce Maria Hernandez Garcia"],
    dato: ["5","M"],
    Periodos: ["1.8","2.2","3.6","4.1"],
    Notas: ["1.8","4.1"],
    datosFin: ["2.9","57"]
    },
    {
    nombre: ["Iker Juarez Castillo"],
    dato: ["2","H"],
    Periodos: ["1.1","x","2","2.8"],
    Notas: ["1.1","2.8"],
    datosFin: ["2","42"]
    },
    {
    nombre: ["Malik Fajardo Lopez"],
    dato: ["4","H"],
    Periodos: ["1.1","2","3.9","x"],
    Notas: ["1.1","3.9"],
    datosFin: ["2.3","70"]
    },
    {
    nombre: ["Santiago Gardunio Rosillo"],
    dato: ["17","H"],
    Periodos: ["3.1","3.9","4.5","5"],
    Notas: ["3.1","5"],
    datosFin: ["4.1","48"]
    },
    {
    nombre: ["Santiago Jesus Hernandez Bolanios"],
    dato: ["11","H"],
    Periodos: ["2.2","3.4","4.1","4.8"],
    Notas: ["2.2","4.8"],
    datosFin: ["3.6","65"]
    }
];

const tablaVariosProg = [
    {
    nombre: ["Participante"],
    dato: ["Edad","Sexo"],
    Periodos: ["P1-EM2020","P2-EM2020","P3-EM2020","P1-AJ2020","P2-AJ2020","P3-AJ2020"],
    Avances: ["P1-EM2020","P2-EM2020","P3-EM2020","P1-AJ2020","P2-AJ2020","P3-AJ2020"]
    },
    {
    nombre: ["Adriana Guadalupe Perez Hernandez"],
    dato: ["6","M"],
    Periodos: ["2.1","2.6","x","2.6","3","2.6"],
    Avances: ["10","33","x","9","12","45"]
    },
    {
    nombre: ["Isaac Carvajal Urbina"],
    dato: ["1","H"],
    Periodos: ["1","x","x","2.2","x","1.9"],
    Avances: ["0","x","x","19","x","11"]
    },
    {
    nombre: ["Dulce Maria Hernandez Garcia"],
    dato: ["5","M"],
    Periodos: ["1.8","2.2","x","2.2","2.8","2.5"],
    Avances: ["10","33","x","9","12","45"]
    },
    {
    nombre: ["Iker Juarez Castillo"],
    dato: ["2","H"],
    Periodos: ["1.1","x","2","2.8","2.6","3.1"],
    Avances: ["6","x","25","25","12","45"]
    },
    {
    nombre: ["Malik Fajardo Lopez"],
    dato: ["4","H"],
    Periodos: ["1.1","2","3.9","x","x","x"],
    Avances: ["4","13","33","x","x","x"]
    },
    {
    nombre: ["Santiago Gardunio Rosillo"],
    dato: ["17","H"],
    Periodos: ["3.1","3.9","2.9","4.5","4.2","3.8"],
    Avances: ["52","74","49","27","9","24"]
    },
    {
    nombre: ["Santiago Jesus Hernandez Bolanios"],
    dato: ["11","H"],
    Periodos: ["2.2","3.4","x","4.1","4.9","3.3"],
    Avances: ["27","58","x","52","46","52"]
    }
];

let consultaGen = {
    promTotal: 3.3,
    totalCoincid: 24,
    avanceGen: 25 
};

let datosConsultas = new DatosConsultas();
const arrows = Arrow.fetchAll();

exports.getResultados = ((request, response, next) => {
    let bools = datosConsultas.getBools();
    Programas.fetchAll()
    .then(([rows_Programas, fieldData_Prog]) => {
        datosConsultas.fetch2()
        .then(([rowsDatos, fieldData_Datos]) => {
            datosConsultas.fetchCants()
            .then((metaData) => {
                console.table(rowsDatos);
                console.table(rows_Programas);
                //console.table(rowsGen);
                response.render('consultas_Resultados', {
                    tituloDeHeader: "Consulta - Resultados",
                    tituloBarra: "Resultados de consulta",
                    //metadata
                    cantProg : metaData.TotProg,
                    cantCiclos : metaData.TotCicl,
                    cantCol : metaData.TotCol,
                    cantPart : metaData.TotPart,
                    ciclos : {ini : metaData.cicloIni, fin : metaData.cicloFin},
                    listaProg : metaData.listaProg,
                    //bools
                    estadoConsulta: bools.estadoConsulta,
                    mostrarSexEdad: bools.mostrarSexEdad,
                    mostrarCalif: bools.mostrarCalif,
                    califOava: bools.califOava,
                    //datos
                    datos: rowsDatos,                    
                    programas: rows_Programas,
                    //datos generales
                    //consultaGen: rowsGen,
                    //datos por grupos/terapeutas
                    programasResultados: programasResultados,
                    //utils
                    backArrow: {display: 'block', link: '/consultas'},
                    forwArrow: arrows[1]
                });
            
                console.log("Consultas Resultados");
                response.status(201);
            }).catch( err => {
                console.log(err);
                response.redirect('/consultas');
            });
        }).catch( err => {
            console.log(err);
            response.redirect('/consultas');
        });
    }).catch( err => {
        console.log(err);
        response.redirect('/consultas');
    });
});

exports.postResultados = ((request, response, next) => {
    console.log("Accion post en resultados");
    response.status(302);
    response.redirect('/consultas');
});

exports.getResultadosPrograma = ((request, response, next) => {
    let bools = datosConsultas.getBools();
    datosConsultas.fetch2()
    .then(([rows, fieldData]) => {
        response.render('consultas_Programa', {
            tituloDeHeader: "Resultados Programa N",
            tituloBarra: "Resultados - Programa 1 - Ciclo EM 2020",
            estadoConsulta: bools.estadoConsulta,
            mostrarSexEdad: bools.mostrarSexEdad,
            mostrarCalif: bools.mostrarCalif,
            consultaGen: consultaGen,
            califOava: bools.califOava,
            tablaVariosProg: tablaVariosProg,
            tablaUnProg: tablaUnProg,
            backArrow: {display: 'block', link: '/consultas/Resultados'},
            forwArrow: arrows[1]
        });
        console.log("Consultas Resultados por programa");
        response.status(201);
    }).catch( err => {
        console.log(err);
        response.redirect('/consultas');
    });
});

exports.postResultadosPrograma = ((request, response, next) => {
    console.log("Accion post en resultados por programa");
    response.status(302);
    response.redirect('/consultas/Resultados');
});

exports.getConsultas = ((request, response, next) => {
    Ciclo.fetchFechaCiclo(0)
    .then(([rows_Fechas, fieldData_Fechas]) => {
        Ciclo.fetchCantPorAno(0)
        .then(([rows_CantAno, fieldData_CantAno]) => {
            Programas.fetchAll()
            .then(([rows_Programas, fieldData_Prog]) => {
                response.render('consultas', {
                    tituloDeHeader: "Consultas",
                    tituloBarra: "Consultas",
                    años: rows_CantAno,
                    fechasDeCiclos: rows_Fechas,
                    programasConsutas: rows_Programas,
                    numProg: rows_Programas.length,
                    meses: DatosConsultas.fetchMeses(),
                    color: DatosConsultas.fetchColors(),
                    backArrow: arrows[0],
                    forwArrow: arrows[1]
                });
                console.log("Consultas");
                response.status(201);
            }).catch(err => {
                console.log(err);
                response.redirect('/');
            });
        }).catch(err => {
            console.log(err);
            response.redirect('/');
        });
    }).catch(err => {
        console.log(err);
        response.redirect('/');
    });
});

exports.postConsultas = ((request, response, next) => {
    if(datosConsultas.getModoConsulta() < 1){
        console.log("Accion post en consultas INCORRECTA");
        response.status(304);
        response.redirect('/consultas');
        response.end();
    } else {
        datosConsultas.setValues(
            request.body.inCiclosIni,
            request.body.chRangoCiclos === "on" ? true : false,
            request.body.inCiclosFin,
            datosConsultas.getModoConsulta() > 1 ? false : true,
            request.body.swCalifOProg === "on" ? true : false,
            request.body.chEdad === "on" ? true : false,
            request.body.inEdadIni,
            request.body.chRangoEdad === "on" ? true : false,
            request.body.inEdadFin,
            request.body.chSexo === "on" ? true : false,
            request.body.swSexo === "on" ? true : false,
            request.body.datosPart === "on" ? true : false,
            request.body.datosProg === "on" ? true : false);
        console.log("Accion post en consultas");
        response.status(302);
        response.redirect('/consultas/Resultados');
        response.end();
    }
});

exports.postSelProgram = ((request, response, next) => {
    datosConsultas.setListaProg(request.body.listaProg);
    //listaProgam = request.body.listaProg;
    //console.table(listaProgam);
});