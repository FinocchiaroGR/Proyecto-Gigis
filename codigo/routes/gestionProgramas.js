const express = require('express');
const subrouter = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

//fileStorage: Es nuestra constante de configuración para manejar el almacenamiento
const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        //'uploads': Es el directorio del servidor donde se subirán los archivos 
        callback(null, 'uploads/imagenes');
    },
    filename: (request, file, callback) => {
        //aquí configuramos el nombre que queremos que tenga el archivo en el servidor, 
        //para que no haya problema si se suben 2 archivos con el mismo nombre concatenamos el timestamp
        callback(null, new Date().getMonth()+'_'+ new Date().getMilliseconds() + '_' + file.originalname);
    },
});

subrouter.use(multer({ storage: fileStorage}).single('imagen')); 
subrouter.use(bodyParser.urlencoded({ extended: false }));
subrouter.use(express.static(path.join(__dirname,'..', 'public')));

const gestionPrograController = require('../controllers/gestion_programas_controller');
const isAuth = require('../util/is-auth.js');

subrouter.get('/objetivos/:nivel_id',isAuth, gestionPrograController.nivelObjetivos);

subrouter.post('/objetivos/agregar-objetivo', isAuth, gestionPrograController.registrarObjetivo);

subrouter.post('/objetivos/editar-objetivo', isAuth, gestionPrograController.editarObjetivo);

subrouter.post('/objetivos/eliminar-objetivo', isAuth, gestionPrograController.eliminarObjetivo);

subrouter.post('/buscar-objetivo',isAuth, gestionPrograController.buscarObjetivo);

subrouter.get('/', isAuth, gestionPrograController.get);

subrouter.post('/', isAuth, gestionPrograController.postNuevoPrograma);

subrouter.post('/editarPrograma',isAuth, gestionPrograController.editarPrograma);

subrouter.post('/editar-niveles',isAuth, gestionPrograController.editarNiveles);

subrouter.post('/buscar-programa',isAuth, gestionPrograController.buscarPrograma);

subrouter.post('/agregarNivel',isAuth, gestionPrograController.agregarNivel);

module.exports = subrouter;