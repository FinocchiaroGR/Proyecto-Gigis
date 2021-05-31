const db = require('../util/database');

module.exports = class Terapeuta{
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(login, titulo, cv, estatus) {
    this.login = login;
    this.titulo = titulo;
    this.cv = cv;
    this.estatus = estatus;
}

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
        'INSERT INTO terapeutas (login, titulo, cv, estatus) VALUES (?, ?, ?, ?)',
        [this.login, this.titulo, this.cv, this.estatus]
    );
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM terapeutas');
  }

  static fetchById(login) {
    return db.execute('Select * From terapeutas Where login = ?',
      [login]
    );
  }

  static deleteById(login) {
    return db.execute('DELETE FROM terapeutas WHERE login = ?',
    [login]);
  }

  static changeStatusToB(login) {
    return db.execute("UPDATE terapeutas SET estatus = 'B' WHERE login = ?",
    [login]);
  }

  static updateTerapeuta(login, titulo, estatus) {
    return db.execute('UPDATE terapeutas SET titulo = ?, estatus = ? WHERE terapeutas.login = ?', 
    [titulo, estatus, login]);
  }
  
  static updateTerapeutaCv(cv, login) {
    return db.execute('UPDATE terapeutas SET cv = ? WHERE terapeutas.login = ?', 
    [cv, login]);
  }
}