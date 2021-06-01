const express = require('express');
const subrouter = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

subrouter.use(bodyParser.urlencoded({ extended: false }));
subrouter.use(express.static(path.join(__dirname,'..', 'public')));
const gestionParticController = require('../controllers/gestion_participantes_controller');
const isAuth = require('../util/is-auth.js');

subrouter.post('/modificar-participante', isAuth, gestionParticController.postModPar);
subrouter.post('/update-participante', isAuth, gestionParticController.postUpdatePar);
subrouter.post('/delete-participante', isAuth, gestionParticController.deleteParticipante);

subrouter.get('/perfil/:login', isAuth, gestionParticController.getPerfil);

subrouter.get('/buscar/:criterio', isAuth, gestionParticController.getBuscar);

subrouter.get('/', isAuth, gestionParticController.get);

subrouter.post('/', isAuth, gestionParticController.post);

module.exports = subrouter;

