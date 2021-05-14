const db = require('../util/database');

module.exports = class Funcion {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(idFuncion, requisitoFuncional) {
    this.idFuncion = idFuncion;
    this.requisitoFuncional = requisitoFuncional;
  }

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO roles (requisitoFuncional) VALUES (?)',
      [this.requisitoFuncional]
    );
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM funciones');
  }
}