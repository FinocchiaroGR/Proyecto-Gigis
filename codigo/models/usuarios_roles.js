const db = require('../util/database');

module.exports = class Usuario_Rol {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(login, idRol) {
    this.login = login;
    this.idRol = idRol;
}

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO `usuarios_roles` (`login`, `idRol`) VALUES (?, ?)',
      [this.login,this.idRol]
    );
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM usuarios_roles');
  }

  static deleteById(login) {
    return db.execute('DELETE FROM usuarios_roles WHERE login = ?',
    [login]);
  }
}