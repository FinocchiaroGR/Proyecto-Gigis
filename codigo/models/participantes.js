const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class Participante {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(login, password, nombreUsuario, apellidoPaterno, apellidoMaterno, estatus, sexo, fechaNacimiento, telefonoPadre) {
        this.login = login;
        this.password = password;
        this.nombreUsuario = nombreUsuario;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
        this.estatus = estatus;
        this.sexo = sexo;
        this.fechaNacimiento = fechaNacimiento;
        this.telefonoPadre = telefonoPadre;
    }
    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return bcrypt.hash(this.password, 12)
            .then( (password) => {
                return db.execute('INSERT INTO usuarios (login, password, nombreUsuario, apellidoPaterno, apellidoMaterno) VALUES (?, ?, ?, ?, ?)',
                    [this.login, password,this.nombreUsuario, this.apellidoPaterno,this.apellidoMaterno]
                ).then(() => {
                    db.execute('INSERT INTO participantes (login, estatus, sexo, fechaNacimiento, telefonoPadre) VALUES (?, ?, ?, ?,?)',
                        [this.login,this.estatus,this.sexo,this.fechaNacimiento,this.telefonoPadre])
                }).catch(err => {
                    console.log(err);
                });
            }).catch( err => {
                console.log(err); 
                throw Error("Nombre de usuario duplicado");  
            });
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute('SELECT nombreUsuario, apellidoPaterno, apellidoMaterno, P.login, estatus, password, sexo, fechaNacimiento, telefonoPadre  FROM participantes P,usuarios U WHERE P.login = U.login');
    }

    static fetchAllPart() {
        return db.execute('SELECT * FROM participantes');

    }

    static fetchActivos() {
        return db.execute(
          'SELECT nombreUsuario, apellidoPaterno, apellidoMaterno, U.login FROM  usuarios U, participantes P WHERE   U.login = P.login AND P.estatus = "A"');
      }
    
    static fetchPorCriterio(criterio) {
        return db.execute(
            'SELECT nombreUsuario, apellidoPaterno, apellidoMaterno, estatus, U.login FROM  usuarios U, participantes P WHERE   U.login = P.login AND P.estatus = "A" AND (nombreUsuario LIKE ? OR apellidoPaterno LIKE ? OR apellidoMaterno LIKE ?)',
            ['%'+criterio+'%','%'+criterio+'%','%'+criterio+'%']);
    }

    static fetchOneUsuarioParticipante(login) {
        return db.execute('SELECT U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno, U.login, P.estatus, P.sexo, P.fechaNacimiento, P.telefonoPadre FROM  usuarios U, participantes P WHERE U.login = P.login AND U.login = ? GROUP BY U.login',
        [login]);
    }
    
    static updateParticipante(estatus, sex, fecha, tel, login) {
        return db.execute('UPDATE `participantes` SET `estatus` = ?, `sexo` = ?, `fechaNacimiento` = ?, `telefonoPadre` = ?  WHERE `participantes`.`login` = ?',
          [estatus, sex, fecha, tel, login]);
    }

    static deleteById(login) {
        return db.execute('DELETE FROM participantes WHERE login = ?',
        [login]);
    }

    static changeStatusToB(login) {
        return db.execute("UPDATE participantes SET estatus = 'B' WHERE login = ?",
        [login]);
      }
    static fetchById(login) {
        return db.execute('Select * From participantes Where login = ?',
          [login]
        );
    }
}