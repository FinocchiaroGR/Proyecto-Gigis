const express = require('express');
const subrouter = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

subrouter.use(bodyParser.urlencoded({ extended: false }));
subrouter.use(express.static(path.join(__dirname,'..', 'public')));
const gestionParticController = require('../controllers/gestion_participantes_controller');
const isAuth = require('../util/is-auth.js');

subrouter.get('/editar-participante', isAuth, gestionParticController.getEditPartic);

subrouter.post('/editar-participante', isAuth, gestionParticController.postEditPartic);

subrouter.get('/perfil-participante', isAuth, gestionParticController.getPerfilPartic);

subrouter.get('/buscar/:criterio', isAuth, gestionParticController.getBuscar);

subrouter.get('/', isAuth, gestionParticController.get);

subrouter.post('/', isAuth, gestionParticController.post);

module.exports = subrouter;

