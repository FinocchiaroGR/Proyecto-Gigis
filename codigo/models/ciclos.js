const db = require('../util/database');

module.exports = class Ciclo {
  //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
  constructor(idCiclo, fechaInicial, fechaFinal) {
    this.fechaInicial = fechaInicial;
    this.fechaFinal = fechaFinal;
    this.idCiclo = idCiclo;
  }

  //Este método servirá para guardar de manera persistente el nuevo objeto.
  save() {
    return db.execute(
      'INSERT INTO ciclos (idCiclo,fechaInicial, fechaFinal) VALUES (?,?,?)',
      [this.idCiclo,this.fechaInicial, this.fechaFinal]
    );
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static fetchAll() {
    return db.execute('SELECT * FROM ciclos');
  }

  //Este método servirá para devolver los objetos del almacenamiento persistente.
  static idCicloActual() {
    return db.execute(
      'SELECT idCiclo FROM `ciclos` WHERE fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE'
    );
  }

  static fetchIdCiclo(fecha) {
    return db.execute(
      'SELECT idCiclo FROM `ciclos` WHERE fechaInicial<DATE(?) AND fechaFinal>DATE(?)',
      [fecha, fecha]
    );
  }

  static fetchFechaCiclo(modo){
    switch(modo){
      case 1://devuelve tabla fechas inciales de cada ciclo
        return db.execute('SELECT MONTH(fechaInicial) AS `mes_inicio`, DAY(fechaInicial) AS `dia_inicio` FROM `ciclos`');
      case 2://devuelve tabla fechas finale de cada ciclo
        return db.execute('SELECT MONTH(fechaFinal) AS `mes_fin`, DAY(fechaFinal) AS `dia_fin` FROM `ciclos`');
      default://devuelve tabla con fechas iniciales y finales de cada ciclo
        return db.execute('SELECT MONTH(fechaInicial) AS `mes_inicio`, DAY(fechaInicial) AS `dia_inicio`, MONTH(fechaFinal) AS `mes_fin`, DAY(fechaFinal) AS `dia_fin` FROM `ciclos`'); 
    }
    
  }

  static fetchCantPorAno(modo){
    switch(modo){
      case 1: //devuelve cuantos ciclos iniciaron en cada año
        return db.execute(
          'SELECT YEAR(fechaInicial) as `ano_inicio`, COUNT(fechaInicial) as `cant_por_ano` FROM `ciclos` GROUP BY YEAR(fechaInicial)'
        );
      case 2: //devuelve cuantos ciclos terminaron en cada año
        return db.execute(
          'SELECT YEAR(fechaFinal) as `ano_fin`, COUNT(fechaFinal) as `cant_por_ano` FROM `ciclos` GROUP BY YEAR(fechaFinal)'
        );
      default: //devuelve cuanto ciclos acabaron y terminaron en cada año
        return db.execute(
          'SELECT YEAR(fechaInicial) as `ano_inicio`, YEAR(fechaFinal) as `ano_fin` , COUNT(fechaInicial) as `cant_por_ano_inicio`, COUNT(fechaFinal) as `cant_por_ano_fin` FROM `ciclos` GROUP BY YEAR(fechaInicial),  YEAR(fechaFinal)'
        );
    }
  }
  static fetchCiclosAnioActual(){
    return db.execute(
      'SELECT * FROM ciclos WHERE YEAR(fechaInicial)>= YEAR(CURRENT_DATE)'
    );
  }

  static fetchAniosPasados(){
    return db.execute(
      'SELECT YEAR(fechaInicial) AS anio FROM ciclos WHERE YEAR(fechaInicial)< YEAR(CURRENT_DATE) GROUP BY YEAR(fechaInicial) DESC'
    );
  }
  static fetchFechaFinalUltimoCiclo(){
    return db.execute(
      'SELECT DATE_FORMAT(fechaFinal, "%Y,%m,%d") fechaFinal FROM ciclos WHERE fechaFinal IN (SELECT MAX(fechaFinal) AS ultimaFecha FROM ciclos)'
    );
  }

  static fetchIdPorFechaFinal(fechaCiclo){
    return db.execute(
      'SELECT idCiclo FROM ciclos WHERE fechaFinal = ?',
      [fechaCiclo]
    );
  }

  static fetchUnoPorId(idCiclo){
    return db.execute('SELECT * FROM ciclos WHERE idCiclo = ?', 
    [idCiclo]);
  }

  static fetchIdUltimo(){
    return db.execute('SELECT MAX(idCiclo) AS idCiclo FROM ciclos');
  }
  


};
