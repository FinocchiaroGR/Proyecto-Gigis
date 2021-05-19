const tabGestion = [
    {
        nombre: 'GESTIÓN DE PERSONAL',
        imagen: '/media/tablero_personal.png',
        ruta:   'gestionUsuarios'
    },
    {
        nombre: 'GESTIÓN DE PARTICIPANTES',
        imagen: '/media/tablero_participante.png',
        ruta:   'gestionParticipantes'
    },
    {
        nombre: 'GESTIÓN DE PROGRAMAS',
        imagen: '/media/tablero_programa.png',
        ruta:   'gestionProgramas'
    },
    {
        nombre: 'GESTION DE CICLOS',
        imagen: '/media/tablero_ciclos.png',
        ruta:   'gestionCiclos'
    }
];

module.exports = class TableroGestion {

    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(nombre, imagen, ruta) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.ruta = ruta;
    }
    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        tabGestion.push(this);
    }

    //Este método servirá para devolver los objetos del almacenamiento persistente.
    static fetchAll() {
        return tabGestion;
    }

}