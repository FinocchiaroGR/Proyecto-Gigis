const Arrow = require('../models/arrow');
const Ciclo = require('../models/ciclos');
const Programas = require('../models/programas');
const DatosConsultas = require('../models/consultasResultados');

let datosConsultas = new DatosConsultas();
const arrows = Arrow.fetchAll();

exports.getResultados = ((request, response, next) => {
    let bools = datosConsultas.getBools();
    Programas.fetchAll()
    .then(([rows_Programas, fieldData_Prog]) => {
        //console.table(rows_Programas);
        datosConsultas.fetch()
        .then(([rowsDatos, fieldData_Datos]) => {
            console.table(rowsDatos);
            datosConsultas.fetchCants()
            .then((metaData) => {
                //console.log(metaData);
                datosConsultas.fetchGen()
                .then(([rowsGen, fieldData_Gen]) => {
                    //console.table(rowsGen);
                    DatosConsultas.fetchPorGroup_cons()
                    .then(([rowsGroup, fieldData_Group]) => {
                        //console.table(rowsGroup);
                        response.render('consultas_Resultados', {
                            tituloDeHeader: "Consulta - Resultados",
                            tituloBarra: "Resultados de consulta",
                            //metadata
                            cantProg : metaData.TotProg,
                            cantCiclos : metaData.TotCicl,
                            cantCol : metaData.TotCol,
                            cantPart : metaData.TotPart,
                            ciclos : {ini : parseInt(metaData.cicloIni),
                                      fin : parseInt(metaData.cicloFin)},
                            listaProg : metaData.listaProg,
                            //bools
                            estadoConsulta: bools.estadoConsulta,
                            mostrarSexEdad: bools.mostrarSexEdad,
                            mostrarCalif: bools.mostrarCalif,
                            califOava: bools.califOava,
                            //datos
                            datos: rowsDatos,
                            col_Datos: fieldData_Datos,
                            programas: rows_Programas,
                            //datos generales
                            consultaGen: rowsGen,
                            col_Gen: fieldData_Gen,
                            //datos por grupos/terapeutas
                            datosGrupos : rowsGroup,
                            //utils
                            backArrow: {display: 'block', link: '/consultas'},
                            forwArrow: arrows[1]
                        });
                        console.log("Consultas Resultados");
                        response.status(201);
                    }).catch( err => {
                        request.session.mensaje = 'Error de comunicacion con el servidor1';
                        request.session.bandera = true;
                        response.redirect('/consultas');
                        console.log(err);
                    })
                }).catch( err => {
                    request.session.mensaje = 'Error de comunicacion con el servidor2';
                    request.session.bandera = true;
                    response.redirect('/consultas');
                    console.log(err);
                })
            }).catch( err => {
                request.session.mensaje = 'Su consulta no arrojó ningun resultado. Por favor ingrese otras condiciones.';
                request.session.bandera = true;
                response.redirect('/consultas');
                console.log(err);
            });
        }).catch( err => {
            request.session.mensaje = 'Error de actualizacion de la base de datos';
            request.session.bandera = true;
            response.redirect('/consultas');
            console.log(err);
        });
    }).catch( err => {
        request.session.mensaje = 'Error de comunicacion con el servidor';
        request.session.bandera = true;
        response.redirect('/consultas');
        console.log(err);
    });
});

exports.postResultados = ((request, response, next) => {
    console.log("Accion post en resultados");
    response.status(302);
    response.redirect('/consultas');
});

exports.getResultadosGrupo = ((request, response, next) => {

    const id = request.params.idGrupo;
    let bools = datosConsultas.getBools();

    datosConsultas.fetchPorGrupo(id)
    .then(([rows_dato, fieldData_dato]) => {
        DatosConsultas.DatosGenGrupo(id)
        .then(([rows_Gen, fieldData_Gen]) => {
            console.table(rows_Gen);
            console.table(fieldData_Gen);
            response.render('consultas_Programa', {
                tituloDeHeader: 'Resultados ' + rows_Gen.nombrePrograma,
                tituloBarra: 'Resultados - Programa ' + rows_Gen.idPrograma + ' - Ciclo ' + rows_Gen.idCiclo,
                mostrarSexEdad: bools.mostrarSexEdad,
                mostrarCalif: bools.mostrarCalif,
                col_Datos : fieldData_dato,
                datos : rows_dato,
                datoGrupo : rows_Gen,
                backArrow: {display: 'block', link: '/consultas/Resultados'},
                forwArrow: arrows[1]
            });
            console.log("Consultas Resultados por Grupo");
            response.status(201);
        }).catch( err => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/consultas');
            console.log(err);
        });
    }).catch( err => {
        request.session.mensaje = 'Error de comunicacion con el servidor';
        request.session.bandera = true;
        response.redirect('/consultas');
        console.log(err);
    });
});

exports.postResultadosGrupo = ((request, response, next) => {
    console.log("Accion post en resultados por Grupo");
    response.status(302);
    response.redirect('/consultas/Resultados');
});

exports.getConsultas = ((request, response, next) => {
    const mensaje = request.session.mensaje === undefined ? undefined : request.session.mensaje;
    const bandera = request.session.bandera === undefined ? undefined : request.session.bandera;
    DatosConsultas.prepConsulta();

    Ciclo.fetchFechaCiclo(0)
    .then(([rows_Fechas, fieldData_Fechas]) => {
        Ciclo.fetchCantPorAno(0)
        .then(([rows_CantAno, fieldData_CantAno]) => {
            Programas.fetchAll()
            .then(([rows_Programas, fieldData_Prog]) => {
                response.render('consultas', {
                    mensaje: mensaje,
                    bandera: bandera,
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
                request.session.mensaje = undefined;
                request.session.bandera = undefined;
                console.log("Consultas");
                response.status(201);
            }).catch(err => {
                request.session.mensaje = 'Error de comunicacion con el servidor';
                request.session.bandera = true;
                response.redirect('/consultas');
                console.log(err);
            });
        }).catch(err => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/consultas');
            console.log(err);
        });
    }).catch(err => {
        request.session.mensaje = 'Error de comunicacion con el servidor';
        request.session.bandera = true;
        response.redirect('/consultas');
        console.log(err);
    });
});

exports.postConsultas = ((request, response, next) => {
    if(datosConsultas.getModoConsulta() < 1){
        console.log("Accion post en consultas INCORRECTA");
        request.session.mensaje = 'Debe seleccionar al menos un programa';
        request.session.bandera = true;
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