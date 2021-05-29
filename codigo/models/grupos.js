const db = require('../util/database');

module.exports = class Grupo {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(idGrupo,numeroGrupo, idPrograma, idCiclo, login) {
    this.idGrupo = idGrupo;
    this.numeroGrupo = numeroGrupo;
    this.idPrograma = idPrograma;
    this.idCiclo = idCiclo;
    this.login = login;
  }

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO grupos (idGrupo, numeroGrupo, idPrograma, idCiclo) VALUES (?,?,?,?)',
      [this.idGrupo,this.numeroGrupo, this.idPrograma, this.idCiclo]
    ).then(() => {
      return db.execute('INSERT INTO grupos_terapeutas (idGrupo, login) VALUES (?, ?)',
      [this.idGrupo,this.login])
    }).catch(err => {
        console.log(err);
    });
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM grupos');
  }

  static fetchIdPrograma(idGrupo) {
    return db.execute('SELECT idPrograma FROM grupos WHERE idGrupo=?', [idGrupo])
  }

  static fetchGruposCicloActual() {
    return db.execute(
      'SELECT G.idGrupo,numeroGrupo,G.idPrograma, T.login FROM grupos G ,ciclos C, programas P, grupos_terapeutas T WHERE G.idCiclo=C.idCiclo AND G.idPrograma=P.idPrograma AND T.idGrupo = G.idGrupo AND fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE'
    );
  }

  static fethcGruposProgramaActual(idPrograma) {
    return db.execute(
      'SELECT G.idPrograma,numeroGrupo,G.idGrupo,nombrePrograma,GP.login, U.nombreUsuario, U.apellidoPaterno FROM grupos G ,ciclos C, programas P, grupos_terapeutas GP, usuarios U WHERE G.idCiclo=C.idCiclo AND G.idPrograma=P.idPrograma AND G.idGrupo=GP.idGrupo AND GP.login=U.login AND fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE AND P.idPrograma=?',
      [idPrograma]
    );
  }

  static fetchIdUltimoGrupo() {
    return db.execute(
      'SELECT MAX(idGrupo) AS idlastgrupo FROM grupos'
    );
  }

  static fetchGPorIdCiclo(idCiclo) {
    return db.execute(
      'SELECT U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno, U.login, G.idPrograma, G.idGrupo FROM grupos G, grupos_terapeutas GT, usuarios_roles UR, usuarios U WHERE GT.idGrupo = G.idGrupo AND UR.login = U.login AND GT.login = U.login AND GT.login = UR.login AND UR.idRol = 2 AND G.idCiclo = ?',
      [idCiclo]);
  }

};
