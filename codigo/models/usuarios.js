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
      'SELECT nombreUsuario, apellidoPaterno, U.login, R.nombre FROM  usuarios U, roles R, usuarios_roles UR WHERE R.idRol = UR.idRol AND U.login = UR.login AND  R.nombre NOT LIKE ? GROUP BY U.login ORDER BY U.nombreUsuario',
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

  static fetchOneUsuarioTerapeuta(login) {
    return db.execute('SELECT `nombreUsuario`, `apellidoPaterno`, `apellidoMaterno`, `password`, U.login, R.nombre, R.idRol FROM  usuarios U, roles R, usuarios_roles UR WHERE U.login = UR.login AND R.idRol = UR.idRol AND U.login = ? GROUP BY R.idRol',
    [login]
    );
  }

  static updateUser(newLogin, nombre, apellidoP, apellidoM, oldLogin) {
    return db.execute('UPDATE `usuarios` SET `login` = ?, `nombreUsuario` = ?, `apellidoPaterno` = ?, `apellidoMaterno` = ? WHERE `usuarios`.`login` = ?',
      [newLogin, nombre, apellidoP, apellidoM, oldLogin]);
  }

  static deleteById(login) {
    return db.execute('DELETE FROM usuarios WHERE login = ?',
    [login]);
  }
  
  static changeLogin(login, alt) {
    return db.execute('UPDATE `usuarios` SET `login` = ? WHERE `usuarios`.`login` = ?', 
    [alt, login]);
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

  static permisos (login) {
    return db.execute('SELECT idFuncion FROM usuarios_roles UR, roles_funciones RF WHERE RF.idRol = UR.idRol AND UR.login = ?', [login]);
  }

  static rol (login) {
    return db.execute('SELECT idRol FROM usuarios_roles WHERE login = ?', [login]);
  }

  static fetchPorCriterio(criterio) {
    return db.execute(
      'SELECT U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno, U.login, R.nombre FROM roles R, usuarios_roles UR, usuarios U LEFT JOIN participantes P ON  U.login = P.login WHERE R.idRol = UR.idRol  AND UR.login = U.login AND  R.idRol != 1 AND(U.nombreUsuario LIKE ? OR U.apellidoPaterno LIKE ? OR U.apellidoMaterno LIKE ?) AND P.login IS NULL GROUP BY U.login',
      ['%'+criterio+'%','%'+criterio+'%','%'+criterio+'%']
      );
  }


}