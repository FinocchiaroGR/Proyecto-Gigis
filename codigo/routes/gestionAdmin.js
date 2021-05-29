const express = require('express');
const router = express.Router();

const path = require('path');
const bodyParser = require('body-parser');

const gestionAdminController = require('../controllers/gestion_admin_controller')
const isAuth = require('../util/is-auth.js');

const rutasGestionProgramas = require('./gestionProgramas');
const rutasGestionParticipantes = require('./gestionParticipantes');
const rutasGestionUsuarios = require('./gestionUsuarios');
const rutasGestionCiclos = require('./gestionCiclos');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname,'..', 'public')));

router.use('/gestionUsuarios', isAuth, rutasGestionUsuarios);

router.use('/gestionParticipantes', isAuth, rutasGestionParticipantes);

router.use('/gestionProgramas', isAuth, rutasGestionProgramas);

router.use('/gestionCiclos', isAuth, rutasGestionCiclos);

router.get('/', isAuth, gestionAdminController.get);

module.exports = router;