const db = require('../util/database');

module.exports = class Objetivo {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(idNivel, descripcion) {
        this.idNivel = idNivel;
        this.descripcion = descripcion;
    }

    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return db.execute('INSERT INTO objetivos (idNivel, descripcion) VALUES(?, ?)', 
            [this.idNivel, this.descripcion]
        );
    }


    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute ('SELECT * FROM objetivos')
    }

    static fetch(criterio, idNivel) {
        return db.execute('SELECT * FROM objetivos WHERE idNivel = ? AND descripcion LIKE ?' , [idNivel, '%'+criterio+'%']);
    }

    static objetivosPorNivel(idNivel) {
        return db.execute ('SELECT * FROM objetivos WHERE idNivel=?',[idNivel])
    }

    static actualizarObjetivo(idNivel, idObjetivo, descripcion) {
        return db.execute('UPDATE objetivos SET descripcion=? WHERE idNivel=? AND idObjetivo=?', [descripcion,idNivel,idObjetivo])
    }

    static eliminar(idObjetivo){
        return db.execute('UPDATE objetivos SET estatus=0 WHERE idObjetivo=?', [idObjetivo])
    }

    static existe(descripcion, idNivel) {
        return db.execute('SELECT * FROM objetivos WHERE descripcion LIKE ? AND idNivel=?', [descripcion, idNivel])
    }

    static activar(descripcion){
        return db.execute('UPDATE objetivos SET estatus=1 WHERE descripcion LIKE ?', [descripcion])
    }

    static objetivosActivosPorNivel(idNivel) {
        return db.execute ('SELECT * FROM objetivos WHERE idNivel=? AND estatus = 1',[idNivel])
    }

    static objetivosPorNivelInscritos(idNivel, login, idGrupo) {
        return db.execute ('SELECT PGO.login, O.*, case when PGO.idObjetivo is null then 0 else 1 end as paloma FROM objetivos O LEFT JOIN participantes_grupos_objetivo PGO ON O.idObjetivo = PGO.idObjetivo AND PGO.idNivel = O.idNivel AND PGO.login = ? AND PGO.idGrupo = ? WHERE O.idNivel = ? AND O.estatus = 1',
        [login, idGrupo, idNivel])
    }

    static deleteObj(login, idGrupo, idNivel) {
        return db.execute ('DELETE FROM participantes_grupos_objetivo WHERE login = ? AND idGrupo = ? AND idNivel = ?',
        [login, idGrupo, idNivel])
    }
}

