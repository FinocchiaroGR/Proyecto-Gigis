const Arrow = require('../models/arrow');
const Ciclo = require('../models/ciclos');
const Programas = require('../models/programas');
const DatosConsultas = require('../models/consultasResultados');
const Historial = require('../models/consultasHistorial');
const Participante = require('../models/participantes');
const fs = require('fs');
const http = require('http');

let datosConsultas = new DatosConsultas();
const arrows = Arrow.fetchAll();

exports.getResultados = ((request, response, next) => {
    const permiso = request.session.permisos;
    if(permiso.includes(5)){ 
        let bools = datosConsultas.getBools();
        Programas.fetchAllSOrd()
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
                            console.table(rowsGroup);
                            response.render('consultas_Resultados', {
                                tituloDeHeader: "Consulta - Resultados",
                                tituloBarra: "Resultados de consulta",
                                permisos: permiso,
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
    }
    else {
      response.status(404);
      response.send('Lo sentimos, este sitio no existe');
    }
});

exports.postResultados = ((request, response, next) => {
    const permiso = request.session.permisos;
    if(permiso.includes(7)){ 
        Programas.fetchAllSOrd()
        .then(([lisProg, Col_programas]) => {
            //console.table(lisProg);
            datosConsultas.fetch()
            .then(([datos, col_Datos]) => {
                //console.table(datos);
                datosConsultas.fetchCants()
                .then((metaData) => {
                    let texto = '';
                    let bools = datosConsultas.getBools();
                
                    /*//metadata
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
                    programas: rows_Programas,*/

                    if(bools.estadoConsulta) {
                        texto += 'Participantes,';
                        if(bools.mostrarSexEdad){
                            texto += 'Sexo,Edad,';
                        }
                        if(bools.mostrarCalif) {
                            let cicloCont = 0, progCont = 0;
                            for(let i = 0; i<metaData.TotCol; i++) {
                                texto += '"' + lisProg[metaData.listaProg[progCont]-1].nombrePrograma +
                                         'Ciclo '+(parseInt(metaData.cicloIni)+cicloCont)+'",';
                                if(((progCont+1) % metaData.TotProg) === 0){
                                    progCont = 0;
                                    cicloCont++;
                                } else {
                                    progCont++;
                                }
                            }
                            texto += '"Calificación_Inicial_Absoluta",';
                            texto += '"Calificación Final Absoluta",';
                            texto += 'Promedio,Avance';
                        }
                        texto += '\n';
                        for(let i = 0; i < metaData.TotPart; i++) {
                            texto += '"' + datos[i].nombreUsuario + ' ' + datos[i].apellidoPaterno + ' ' + datos[i].apellidoMaterno + '",';
                            if(bools.mostrarSexEdad){
                                texto += datos[i].sexo + ',"' + datos[i].Edad + '",';
                            }
                            if(bools.mostrarCalif) {

                                let acumProm=0,contProm = 0,flagfin=0, flagIni=0, par=1;
                                for(let j = 9; j<col_Datos.length; j++) { //9 porque es la primera calif Final

                                    texto += (Math.round((datos[i][col_Datos[j]['name']] ) * 10) / 10) + ',';

                                    if(datos[i][col_Datos[j]['name']] !== null && flagIni === 0){
                                        flagIni = j;
                                    }
                    
                                    if(datos[i][col_Datos[j]['name']] !== null && par % 2 === 0){ 
                                        acumProm += Math.round((datos[i][col_Datos[j]['name']] ) * 10) / 10;
                                        contProm++; 
                                        flagfin = j;
                                    } 
                                    par++;
                                }                         

                                texto += (Math.round((datos[i][col_Datos[flagIni]['name']] ) * 10) / 10) +',';
                                texto += (Math.round((datos[i][col_Datos[flagfin]['name']] ) * 10) / 10) +',';
                                texto += (Math.round((acumProm/contProm ) * 10) / 10) + ',';
                                texto += (Math.round(((datos[i][col_Datos[flagfin]['name']] - datos[i][col_Datos[flagIni]['name']])/(programas[listaProg[0]].puntajeMaximo-1)*100 ) * 10) / 10) + '%,';
                            }
                        }
                    } else {
                        texto += 'Participantes,';
                        if(bools.mostrarSexEdad){
                            texto += 'Sexo,Edad,';
                        }
                        if(bools.mostrarCalif) {
                            let cicloCont = 0, progCont = 0;
                            for(let i = 0; i<metaData.TotCol; i++) {
                                if(!bools.califOava) {

                                }
                                texto += '"' + lisProg[metaData.listaProg[progCont]-1].nombrePrograma +
                                         'Ciclo '+(parseInt(metaData.cicloIni)+cicloCont)+'",';
                                if(((progCont+1) % metaData.TotProg) === 0){
                                    progCont = 0;
                                    cicloCont++;
                                } else {
                                    progCont++;
                                }
                            }
                            texto += '"Calificación_Inicial_Absoluta",';
                            texto += '"Calificación Final Absoluta",';
                            texto += 'Promedio,Avance';
                    }
                                                
                                                    <table class="striped highlight responsive-table">
                                                      <thead>
                                                        <% if(!califOava) { %>
                                                          <tr class="center strong">
                                                
                                                            <td rowspan="2">Participantes</td>
                                                  
                                                            <% if(mostrarSexEdad) { %>
                                                              <td class="center" rowspan="2">Sexo</td>
                                                              <td class="center" rowspan="2">Edad</td>
                                                            <% } %>
                                                  
                                                            <% if(mostrarCalif) { %>
                                                
                                                              <% let cicloCont = 0, progCont = 0;%>
                                                              <% for(let i = 0; i<cantCol; i++) { %>
                                                
                                                                <td class="center" colspan="2"> <%= programas[listaProg[progCont]-1].nombrePrograma %> <br>Ciclo-<%= ciclos.ini+cicloCont %> </td>
                                                
                                                                <% if(((progCont+1) % cantProg) === 0){%>
                                                                  <% progCont = 0; cicloCont++;%>
                                                                <% }else{ %>
                                                                  <%progCont++; %>
                                                                <% } %>
                                                
                                                              <% } %>
                                                
                                                            <% } %>
                                                            
                                                          </tr>
                                                          <tr>
                                                            <% if(mostrarCalif) { %>
                                                              <% for(let i = 0; i<cantCol; i++) { %>
                                                                <td class="center" > Calificación <br> Inicial</td>
                                                                <td class="center"> Calificación <br> Final</td>
                                                              <% } %>
                                                            <% } %>
                                                          </tr>
                                                        <% } else { %>
                                                          <tr class="center strong">
                                                
                                                            <td>Participantes</td>
                                                  
                                                            <% if(mostrarSexEdad) { %>
                                                              <td class="center">Sexo</td>
                                                              <td class="center">Edad</td>
                                                            <% } %>
                                                  
                                                            <% if(mostrarCalif) { %>
                                                
                                                              <% let cicloCont = 0, progCont = 0;%>
                                                              <% for(let i = 0; i<cantCol; i++) { %>
                                                
                                                                <td class="center">Avance <br> <%= programas[listaProg[progCont]-1].nombrePrograma %> <br>Ciclo-<%= ciclos.ini+cicloCont %> </td>
                                                            
                                                                <% if(((progCont+1) % cantProg) === 0){%>
                                                                  <% progCont = 0; cicloCont++;%>
                                                                <% }else{ %>
                                                                  <%progCont++; %>
                                                                <% } %>
                                                
                                                              <% } %>
                                                
                                                            <% } %>
                                                          </tr>
                                                        <% } %>
                                                        
                                                      </thead>
                                                      <tbody>
                                                        <% for(let i = 0; i < cantPart; i++) { %>
                                                          <tr>
                                                            <td><%= datos[i].nombreUsuario %> <%= datos[i].apellidoPaterno %> <%= datos[i].apellidoMaterno %></td>
                                                            <% if(mostrarSexEdad) { %>
                                                              <td class="center"><%= datos[i].sexo %></td>
                                                              <td class="center"><%= datos[i].Edad %></td>
                                                            <% } %>
                                                            <% if(mostrarCalif) { %>
                                                              <% for(let j = 9; j < col_Datos.length; j++) { %>
                                                                <% if(!califOava) { %>
                                                                  <td class="center"><%= Math.round((datos[i][col_Datos[j]['name']] ) * 10) / 10 %></td>
                                                                <% }else{ %>
                                                                  <td class="center"><%= Math.round((datos[i][col_Datos[j]['name']] ) * 100) / 100 %> %</td>
                                                                <% } %>
                                                              <% } %>
                                                            <% } %>
                                                          </tr>
                                                        <% } %>
                                                      </tbody>
                                                    </table> 
                                                <% } %>                
                                                var file = __dirname + './../downloads/reporte.csv';
                                                response.download(file);


                    
                    var file = __dirname + './../downloads/reporte.csv';
                    response.download(file);
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
        }).catch( err => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/consultas');
            console.log(err);
        });
    }
    else {
        response.redirect('/consultas/resultados');
    }
    console.log("Archivo CSV en resultados");
});

exports.getResultadosGrupo = ((request, response, next) => {

    const id = request.params.idGrupo;
    let bools = datosConsultas.getBools();

    const permiso = request.session.permisos;
    if(permiso.includes(5)){ 
        datosConsultas.fetchPorGrupo(id)
        .then(([rows_dato, fieldData_dato]) => {
            DatosConsultas.DatosGenGrupo(id)
            .then(([rows_Gen, fieldData_Gen]) => {
                console.table(rows_Gen);
                console.table(fieldData_Gen);
                response.render('consultas_Programa', {
                    tituloDeHeader: 'Resultados ' + rows_Gen.nombrePrograma,
                    tituloBarra: 'Resultados - Programa ' + rows_Gen.idPrograma + ' - Ciclo ' + rows_Gen.idCiclo,
                    permisos: permiso,
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
                response.redirect('/consultas/Resultados');
                console.log(err);
            });
        }).catch( err => {
            request.session.mensaje = 'Error de comunicacion con el servidor';
            request.session.bandera = true;
            response.redirect('/consultas/Resultados');
            console.log(err);
        });
    }
    else {
      response.status(404);
      response.send('Lo sentimos, este sitio no existe');
    }
});

exports.postResultadosGrupo = ((request, response, next) => {

});

exports.getConsultas = ((request, response, next) => {
    const mensaje = request.session.mensaje === undefined ? null : request.session.mensaje;
    const bandera = request.session.bandera === undefined ? null : request.session.bandera;
    const permiso = request.session.permisos;
    console.log(request.session.mensaje);
    console.log(request.session.bandera);
    const tienePermiso = permiso.includes(5);
    if(tienePermiso){     
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
                        permisos: permiso,
                        años: rows_CantAno,
                        fechasDeCiclos: rows_Fechas,
                        programasConsutas: rows_Programas,
                        numProg: rows_Programas.length,
                        meses: DatosConsultas.fetchMeses(),
                        color: DatosConsultas.fetchColors(),
                        permisos: request.session.permisos,
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
    }
    else {
        return response.redirect('/gestionAdmin');
    }
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

exports.getHistorial = ((request, response, next) => {
    const permiso = request.session.permisos;
    const tienePermiso = permiso.includes(14);
    if(tienePermiso){     
        Ciclo.fetchFechaCiclo(0)
        .then(([rows_Fechas, fieldData_Fechas]) => {
            Ciclo.fetchCantPorAno(0)
            .then(([rows_CantAno, fieldData_CantAno]) => {
                Participante.fetchAll()
                .then(([rows_Participantes, fieldData_Prog]) => {
                    response.render('consultas_Historial', {
                        tituloDeHeader: "Historial - Consultas",
                        tituloBarra: "Historial por alumno",
                        permisos: permiso,
                        años: rows_CantAno,
                        fechasDeCiclos: rows_Fechas,
                        participantes: rows_Participantes,
                        numPart: rows_Participantes.length,
                        meses: DatosConsultas.fetchMeses(),
                        permisos: request.session.permisos,
                        backArrow: {display: 'block', link: '/consultas'},
                        forwArrow: arrows[1]
                    });
                    console.log("Consultas - Historial");
                    response.status(201);
                }).catch(err => {
                    response.redirect('/consultas');
                    console.log(err);
                });
            }).catch(err => {
                response.redirect('/consultas');
                console.log(err);
            });
        }).catch(err => {
            response.redirect('/consultas');
            console.log(err);
        });
    }
    else {
        return response.redirect('/gestionAdmin');
    }
});

exports.returnHistorial = ((request, response, next) => {

    Historial.fetchHistorial(
        request.params.criterio,
        request.body.inCiclosIni,
        request.body.chRangoCiclos,
        request.body.inCiclosFin
    )
        .then(([rows, fieldData]) => {
            //console.table(rows);
            return response.status(200).json({historial: rows});
        })
        .catch(err => {
            console.log(err)
        });
});