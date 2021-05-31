const db = require('../util/database');

module.exports = class Participante_Grupo_Objetivo {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(login, idGrupo, idNivel, idObjetivo) {
        this.login = login;
        this.idGrupo = idGrupo;
        this.idNivel = idNivel;
        this.idObjetivo = idObjetivo;
    }
    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return db.execute('INSERT INTO participantes_grupos_objetivo (login,idGrupo, idNivel, idObjetivo) VALUES (?, ?, ?, ?)',
            [this.login, this.idGrupo,this.idNivel, this.idObjetivo]
        )
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute('SELECT * FROM participantes_grupos_objetivos');
    }

    static fetchObjetivosPorParticipante(idGrupo, login) {
        return db.execute('SELECT U.login, U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno, PGO.idGrupo,O.idObjetivo, O.descripcion, PGO.puntajeInicial, PGO.puntajeFinal, P.puntajeMaximo FROM participantes_grupos_objetivo PGO, objetivos O, programas P, grupos G, usuarios U WHERE PGO.idObjetivo=O.idObjetivo AND PGO.idGrupo=G.idGrupo AND G.idPrograma=P.idPrograma AND PGO.login=U.login AND PGO.idGrupo=? AND PGO.login=?',[idGrupo, login]);
    }

    static fetchParticipantesPorPrograma(idPrograma) {
        return db.execute('SELECT PGO.login, U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno, PGO.idGrupo, N.nombreNivel FROM participantes_grupos_objetivo PGO, grupos G, ciclos C, usuarios U, niveles N WHERE PGO.idGrupo=G.idGrupo AND G.idCiclo=C.idCiclo AND PGO.login=U.login AND PGO.idNivel=N.idNivel AND G.idPrograma=? AND fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE GROUP BY PGO.login ORDER BY PGO.login ASC', [idPrograma]);
    }

    static ActualizarPuntajes(login, idGrupo, idObjetivo, pInicial, pFinal) {
        return db.execute('UPDATE participantes_grupos_objetivo SET puntajeInicial=?, puntajeFinal=? WHERE login=? AND idGrupo=? AND idObjetivo=?',[pInicial,pFinal,login,idGrupo,idObjetivo]);
    }

    static calificacionesPorPrograma(idPrograma) {
        return db.execute('SELECT *, AVG(puntajeFinal) AS calificaciones FROM participantes_grupos_objetivo PGO WHERE EXISTS (SELECT * FROM participantes_grupos_objetivo PGO1 , grupos G, ciclos C WHERE PGO1.idGrupo=G.idGrupo AND G.idCiclo=C.idCiclo AND PGO.login=PGO1.login AND PGO.idGrupo = PGO1.idGrupo AND PGO.idNivel = PGO1.idNivel AND PGO.idObjetivo= PGO1.idObjetivo  AND fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE AND G.idPrograma=? AND puntajeFinal>0) GROUP BY login ORDER BY PGO.login ASC', [idPrograma])
    }
    
    static fetchLoginIncritos(idGrupo) {
        return db.execute('SELECT login FROM participantes_grupos_objetivo WHERE idGrupo = ? GROUP BY(login)',
        [idGrupo]);
    }

    static fetchIncrito(idGrupo, login) {
        return db.execute('SELECT * FROM participantes_grupos_objetivo WHERE idGrupo = ? AND login = ?',
        [idGrupo, login]);
    }

    static fetchIfParticipanteHaveGroups(login) {
        return db.execute('SELECT COUNT(*) AS num_groups FROM participantes_grupos_objetivo WHERE login = ?',
        [login]);
    }
}