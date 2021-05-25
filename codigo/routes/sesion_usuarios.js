//Dependencias
const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/sesion_usuarios_controller');
const isAuth = require('../util/is-auth.js');


router.get('/login', usuariosController.getlogin);
router.post('/login', usuariosController.postlogin);
router.get('/logout',usuariosController.logout);
router.get('/password', isAuth,usuariosController.cambiarContraseña);
router.post('/cambiar-pass',isAuth, usuariosController.postCambiarContraseña);

module.exports = router;