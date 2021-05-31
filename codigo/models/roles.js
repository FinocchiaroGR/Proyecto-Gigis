const db = require('../util/database');

module.exports = class Rol {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(nombre) {
    this.nombre = nombre;
}

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO roles (`idRol`, `nombre`) VALUES (null,?)',
      [this.nombre]
    );
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM roles');
  }

  static fetchId(nombre) {
    return db.execute('SELECT `idRol` FROM roles WHERE `nombre` = ?',
    [nombre]
    );
  }

  static fetchAllRolsByLogin(login) {
    return db.execute('SELECT R.*, CASE WHEN UR.idRol is null then 0 else 1 end as foo FROM roles R LEFT JOIN usuarios_roles UR ON UR.idRol = R.idRol AND UR.login = ? GROUP BY R.idRol',
    [login]
    );
  }

  static fetchRolNameByLogin(login) {
    return db.execute('SELECT R.* FROM roles R, usuarios_roles UR WHERE UR.idRol = R.idRol AND UR.login = ? GROUP BY R.idRol',
    [login]
    );
  }
}