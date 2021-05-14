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
}