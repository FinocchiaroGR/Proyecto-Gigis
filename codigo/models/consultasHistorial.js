const db = require('../util/database');

module.exports = class Historial {

    static fetchHistorial(loginPart,cicloIni, intervaloCiclo,cicloFin){
        let texto = 'SELECT U.nombreUsuario AS `nombreMaestro`, U.apellidoPaterno AS `apellidoPMaestro`, U.apellidoMaterno AS `apellidoMMaestro`,'+
                    ' P.nombrePrograma, C.CalifInicial, C.CalifFinal, C.Avance  FROM `califdatos` C, grupos_terapeutas G, usuarios U, programas P'+
                    ' WHERE C.login= ? AND C.idGrupo=G.idGrupo AND G.login=U.login AND P.idPrograma=C.idPrograma AND C.idCiclo >= ? AND C.idCiclo<= ?';
        let vars = [loginPart];

        if(intervaloCiclo){
            vars.push(parseInt(cicloIni));
            vars.push(parseInt(cicloFin));
        } else {
            vars.push(parseInt(cicloIni));
            vars.push(parseInt(cicloIni));
        }

        return db.execute(texto,vars);
    }
}