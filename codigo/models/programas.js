const db = require('../util/database');

module.exports = class Programas {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(nombrePrograma, puntajeMaximo, dirImagen) {
        this.nombrePrograma = nombrePrograma;
        this.puntajeMaximo = puntajeMaximo;
        this.dirImagen = dirImagen;
    }

    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return db.execute(
            'INSERT INTO programas (nombrePrograma, puntajeMaximo, dirImagen) VALUES (?,?,?)',
            [this.nombrePrograma,this.puntajeMaximo,this.dirImagen]
          );
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return db.execute('SELECT * FROM programas ORDER BY nombrePrograma ASC');
    }

    static fetch(criterio) {
        return db.execute('SELECT * FROM programas WHERE nombrePrograma LIKE ?' , ['%'+criterio+'%']);
    }

    static fetchIdPrograma(nombrePrograma) {
        return db.execute('SELECT idPrograma FROM programas WHERE nombrePrograma LIKE ?', 
            [nombrePrograma]
        );
    }

    static fetchNombreProg(){
        return db.execute('SELECT idPrograma, nombrePrograma, puntajeMaximo FROM programas');
    }
    
    static fetchProgramasCicloActual() {
        return db.execute(
        'SELECT G.idPrograma, nombrePrograma,GP.login, P.dirImagen, DATE_FORMAT(fechaInicial, "%M") AS fechaInicio , DATE_FORMAT(fechafinal, "%M %Y") AS fechaFinal FROM grupos G ,ciclos C, programas P, grupos_terapeutas GP WHERE G.idCiclo=C.idCiclo AND G.idPrograma=P.idPrograma AND G.idGrupo = GP.idGrupo AND fechaInicial<CURRENT_DATE AND fechaFinal>CURRENT_DATE GROUP BY idPrograma'
        );
    }

    static fetchNombreProgama(idPrograma){
        return db.execute('SELECT nombrePrograma FROM programas WHERE idPrograma=?', 
            [idPrograma]
        );
    }

    static editarPrograma(idPrograma, nombrePrograma, dirImagen) {
        return db.execute('UPDATE programas SET nombrePrograma=?,dirImagen=? WHERE idPrograma=?', [nombrePrograma, dirImagen, idPrograma])
    }

    static editarProgramaSinImagen(idPrograma, nombrePrograma) {
        return db.execute('UPDATE programas SET nombrePrograma=? WHERE idPrograma=?', [nombrePrograma, idPrograma])
    }

    static editarProgramaSinTitulo(idPrograma, dirImagen) {
        return db.execute('UPDATE programas SET dirImagen=? WHERE idPrograma=?', [dirImagen, idPrograma])
    }

    static fetchPorIdCiclo(idCiclo) {
        return db.execute(
        'SELECT P.nombrePrograma, P.idPrograma FROM Programas P, Grupos G WHERE P.idPrograma = G.idPrograma AND G.idCiclo = ? GROUP BY (idPrograma)',
        [idCiclo]
        );
    }

}

