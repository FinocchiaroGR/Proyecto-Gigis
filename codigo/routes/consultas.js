//Dependencias
const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

//Controladores
const consultasController = require('../controllers/consultas_controller');
const isAuth = require('../util/is-auth.js');

//Inicializa dependencias
router.use(bodyParser.urlencoded({extended: false}));

//Enviar archivos estáticos en carpeta public
router.use(express.static(path.join(__dirname,'..', 'public')));

router.get('/Resultados', isAuth, consultasController.getResultados);

router.post('/Resultados', isAuth, consultasController.postResultados);

router.get('/Grupo/:idGrupo', isAuth, consultasController.getResultadosGrupo);

router.post('/Grupo/:idGrupo', isAuth, consultasController.postResultadosGrupo);

router.post('/SelProgram', isAuth, consultasController.postSelProgram);

router.get('/historial', isAuth, consultasController.getHistorial);

router.post('/historial/:criterio', isAuth, consultasController.returnHistorial);

router.get('/', isAuth, consultasController.getConsultas);

router.post('/', isAuth, consultasController.postConsultas);

module.exports = router;