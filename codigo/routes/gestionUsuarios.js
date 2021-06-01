const express = require('express');
const subrouter = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

//fileStorage: Es nuestra constante de configuración para manejar el almacenamiento
const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        //'uploads': Es el directorio del servidor donde se subirán los archivos 
        callback(null, 'uploads/cv');
    },
    filename: (request, file, callback) => {
        //aquí configuramos el nombre que queremos que tenga el archivo en el servidor, 
        //para que no haya problema si se suben 2 archivos con el mismo nombre concatenamos el timestamp
        callback(null, new Date().getMonth()+'_'+ new Date().getMilliseconds() + '_' + file.originalname);
    },
});


//En el registro, pasamos la constante de configuración y
//usamos single porque es un sólo archivo el que vamos a subir, 
//pero hay diferentes opciones si se quieren subir varios archivos. 
//'archivo' es el nombre del input tipo file de la forma
subrouter.use(multer({ storage: fileStorage}).single('cv')); 

subrouter.use(bodyParser.urlencoded({ extended: false }));


subrouter.use(express.static(path.join(__dirname,'..', 'public')));
const gestionUserController = require('../controllers/gestion_usuarios_controller');
const isAuth = require('../util/is-auth.js');
const { isatty } = require('tty');



subrouter.get('/', isAuth, gestionUserController.get);
subrouter.get('/buscar/:criterio', isAuth, gestionUserController.getBuscar);
subrouter.get('/perfil/:login', isAuth, gestionUserController.getPerfil);

subrouter.post('/', isAuth, gestionUserController.postNuevoUsuario);
subrouter.post('/modificar-usuario', isAuth, gestionUserController.postModUser);
subrouter.post('/update-usuario', isAuth, gestionUserController.postUpdateUser);
subrouter.use('/eliminar-usuario', isAuth, gestionUserController.postDeleteUser);

subrouter.post('/crear-roll', isAuth, gestionUserController.postNuevoRoll);
subrouter.post('/modificar-roll', isAuth, gestionUserController.postModRoll);
subrouter.post('/update-roll', isAuth, gestionUserController.postUpdateRoll);

module.exports = subrouter;