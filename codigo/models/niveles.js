const db = require('../util/database');

module.exports = class Nivel {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(nombreNivel, idPrograma) {
        this.nombreNivel = nombreNivel;
        this.idPrograma = idPrograma;
    }

    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return db.execute('INSERT INTO niveles (nombreNivel, idPrograma) VALUES(?, ?)', 
            [this.nombreNivel, this.idPrograma]
        );
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute('SELECT * FROM niveles');
    }

    static fetchNombrePrograma(idNivel) {
        return db.execute('SELECT nombrePrograma, nombreNivel, P.idPrograma FROM niveles N, programas P WHERE P.idPrograma=N.idPrograma AND idNivel=?',[idNivel])
    }

    static fetchPorIdGrupo(idGrupo) {
        return db.execute('SELECT * FROM niveles WHERE idPrograma  IN (SELECT idPrograma FROM grupos WHERE idGrupo = ?)',
        [idGrupo])
    }
    static editarNivel(id, nombre){
        //CALL consultaGenGrupo ( grupo INT )
        let procedimiento = 'CALL modificaNivel (?,?)';
        let parametros = [id,nombre];
        return db.execute(procedimiento,parametros)
    }
}
