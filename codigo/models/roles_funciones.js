const db = require('../util/database');

module.exports = class Rol_Funcion {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(idRol, idfuncion) {
    this.idRol = idRol;
    this.idfuncion = idfuncion;
}

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO `roles_funciones` (`idRol`, `idfuncion`) VALUES (?,?)',
      [this.idRol,this.idfuncion]
    ).catch(error => {
      console.log(error);
    })
  }
  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM roles_funciones');
  }
}