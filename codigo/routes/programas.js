const express = require('express');
const router = express.Router();
const path = require('path');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, '..', 'public')));

const programasController = require('../controllers/programas_controller');
const isAuth = require('../util/is-auth.js');

router.post('/registro-puntajes', isAuth, programasController.registroPuntajes);
router.get('/:id_programa', isAuth, programasController.getProgramas);
router.post('/objetivos-participante', isAuth, programasController.objetivosParticipantes);
router.get('/', isAuth, programasController.get);

module.exports = router;
