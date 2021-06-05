const express = require('express');
const subrouter = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

subrouter.use(bodyParser.urlencoded({ extended: false }));
subrouter.use(express.static(path.join(__dirname,'..', 'public')));
const gestionCicloController = require('../controllers/gestion_ciclos_controller');
const isAuth = require('../util/is-auth.js');

subrouter.get('/inscribir/:idCiclo', isAuth, gestionCicloController.getInscribir);

subrouter.post('/inscribir', isAuth, gestionCicloController.postInscribir);

subrouter.post('/baja', isAuth, gestionCicloController.postBaja);

subrouter.get('/participantes/:idGrupo', isAuth, gestionCicloController.getInsPar);

subrouter.get('/buscar/:criterio', isAuth, gestionCicloController.getBuscarPar);

subrouter.post('/select-nivel', isAuth, gestionCicloController.postSelectNivel);

subrouter.post('/mostrar-obj', isAuth, gestionCicloController.postMostrarObj);

subrouter.post('/agregar-ciclo', isAuth, gestionCicloController.postAgrCiclo);

subrouter.get('/agregar-ciclo', isAuth, gestionCicloController.getAgrCiclo);

subrouter.get('/perfil-ciclo/:idCiclo', isAuth, gestionCicloController.getPerfilCiclo);

subrouter.get('/editar/:idCiclo', isAuth, gestionCicloController.getEditarGrupos);

subrouter.post('/editar', isAuth, gestionCicloController.postEditarGrupos);

subrouter.get('/editar-ciclo/:idCiclo', isAuth, gestionCicloController.getEditarCiclo);

subrouter.post('/editar-ciclo/', isAuth, gestionCicloController.postEditarCiclo);

subrouter.get('/', isAuth, gestionCicloController.get);

module.exports = subrouter;
