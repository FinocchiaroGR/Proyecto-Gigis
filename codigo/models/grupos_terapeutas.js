const db = require('../util/database');

module.exports = class Grupo_Terapeuta {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(idGrupo, login) {
        this.idGrupo = idGrupo;
        this.login = login;
    }
    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return db.execute('INSERT INTO grupos_terapeutas (idGrupo, login) VALUES (?, ?)',
            [this.idGrupo,this.login]
        )
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute('SELECT * FROM grupos_terapeutas');
    }

    static fetchIfTerapeutaHaveGroups(login) {
        return db.execute('SELECT COUNT(*) AS num_groups FROM grupos_terapeutas WHERE login = ?',
        [login]);
    }
}
