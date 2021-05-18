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

  static fetchByIdRol(idRol) {
    return db.execute('SELECT `idfuncion` FROM `roles_funciones` WHERE `idRol` = ?',
    [idRol]
    );
  }

  static fetchJoin(idRol) {
    return db.execute('select F.*, case when RF.idfuncion is null then 0 else 1 end as foo FROM funciones F LEFT JOIN roles_funciones RF ON RF.idfuncion = F.idFuncion AND RF.idRol = ?',
    [idRol]
    );
  }

  static deleteById(idRol) {
    return db.execute('DELETE FROM roles_funciones WHERE idRol = ?',
    [idRol]
    );
  }
}