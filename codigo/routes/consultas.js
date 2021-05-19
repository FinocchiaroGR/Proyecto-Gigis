//Dependencias
const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//Controladores
const consultasController = require('../controllers/consultas_Controller');

//Inicializa dependencias
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());
router.use(session({
    secret: '1d#$%dwe45f#$5sd()=df345#$%bLim&dfvdfg#$12qex%RT(?ipfgh5dvfgdewt56ytbru9',//'mi string secreto que debe ser un string aleatorio muy largo, no como éste, de preferencia que no tenga sentido' 
    resave: false, //La sesión no se guardará en cada petición, sino sólo se guardará si algo cambió 
    saveUninitialized: false, //Asegura que no se guarde una sesión para una petición que no lo necesita
  }));

//Enviar archivos estáticos en carpeta public
router.use(express.static(path.join(__dirname,'..', 'public')));

router.get('/Resultados', consultasController.getResultados);

router.post('/Resultados', consultasController.postResultados);

router.get('/Grupo/:idGrupo', consultasController.getResultadosGrupo);

router.post('/Grupo/:idGrupo', consultasController.postResultadosGrupo);

router.get('/', consultasController.getConsultas);

router.post('/', consultasController.postConsultas);

router.post('/SelProgram', consultasController.postSelProgram);

module.exports = router;