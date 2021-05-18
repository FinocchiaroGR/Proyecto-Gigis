const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class Usuario {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(login, password, nombreUsuario, apellidoPaterno, apellidoMaterno) {
    this.login = login;
    this.password = password;
    this.nombreUsuario = nombreUsuario;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
}

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return bcrypt.hash(this.password, 12)
            .then( (password) => {
                return db.execute(
                  'INSERT INTO usuarios (login, password, nombreUsuario, apellidoPaterno, apellidoMaterno) VALUES (?,?,?,?,?)',
                  [this.login, password,this.nombreUsuario, this.apellidoPaterno,this.apellidoMaterno]
                );
            }).catch( err => {
                console.log(err); 
                throw Error("Nombre de usuario duplicado");  
            });
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM usuarios');
  }

  //Este método servirá para devolver todos los usuarios exceptuando los que tengan el rol que se pasa por parámetro.
  static fetchListaSin(nombreRol) {
    return db.execute(
      'SELECT nombreUsuario, apellidoPaterno, U.login, R.nombre FROM  usuarios U, roles R, usuarios_roles UR WHERE R.idRol = UR.idRol AND U.login = UR.login AND  R.nombre NOT LIKE ? GROUP BY U.login',
      [nombreRol]
      );
  }

   //Este método servirá para devolver usuarios de un solo rol que se pasa por parámetro.
   static fetchNomTerapeutas() {
    return db.execute(
      'SELECT nombreUsuario, apellidoPaterno, U.login FROM  usuarios U, terapeutas T WHERE   U.login = T.login AND T.estatus = "A"'
      );
  }

  //Este método servirá para devolver el nombre de los usuarios
  static fetchNombre(login) {
    return db.execute('SELECT nombreUsuario, apellidoPaterno, apellidoMaterno FROM usuarios WHERE login like ?', [login]);
  }

  static fetchOne(login) {
    return db.execute('SELECT * FROM usuarios WHERE login = ?', [login]);
  }

  static actualizarPassword(password, login) {
    return bcrypt.hash(password, 12)
    .then( (password) => {
        return db.execute(
          'UPDATE usuarios SET password=? WHERE login=?',
          [password, login]
        );
    }).catch( err => {
        console.log(err); 
    });
  }

}