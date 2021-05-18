const Arrow = require('../models/arrow');
const Usuario = require('../models/usuarios');
const Participante = require('../models/participantes');
const Usuario_Rol = require('../models/usuarios_roles');

const arrows = Arrow.fetchAll();
const usuarios = Usuario.fetchAll();
const participantes = Participante.fetchAll();
const usuarios_roles = Usuario_Rol.fetchAll();


exports.getEditPartic = ((request,response,next) => {
    response.render('editar_participante', {
        tituloDeHeader: "Editar participante",
        tituloBarra: "Editar participante",
        backArrow: {display: 'block', link: '/gestionAdmin/gestionParticipantes'},
        forwArrow: arrows[1]
    });
});

exports.postEditPartic = ((request,response,next) => {
    response.redirect('/gestionAdmin/gestionParticipantes/perfil-participante');
    // Aquí se updatearía
    console.log("Accion post en gestionPartcipantesEdit");
});

exports.getPerfilPartic = ((request,response,next) => {
    response.render('perfil_participante', {
        tituloDeHeader: "Perfil participante",
        tituloBarra: "Adriana Guadalupe",
        backArrow: {display: 'block', link: '/gestionAdmin/gestionParticipantes'},
        forwArrow: arrows[1]
    });
});

exports.get = ((request,response,next) => {
    const error = request.session.error === undefined ? false : request.session.error;
    const bandera = request.session.bandera === undefined ? false : request.session.bandera;
    Participante.fetchAll('participante')
        .then(([participantes, fieldData1]) => {
            response.render('gestion_participantes', {
                participantes: participantes,
                error: error,
                bandera: bandera,
                tituloDeHeader: "Gestión de participantes",
                tituloBarra: "Participantes",
                backArrow: {display: 'block', link: '/gestionAdmin'},
                forwArrow: arrows[1]
            });
        })
        .catch((err) => console.log(err));
    request.session.error = undefined;
    request.session.bandera =undefined;
});

exports.post = ((request,response,next) => {
    let apellidoP = request.body.apellidoP === ''? null :  request.body.apellidoP;
    let apellidoM = request.body.apellidoM === ''? null :  request.body.apellidoM;
    let tel = request.body.tel === ''? null :  request.body.tel;
    const participante = new Participante(request.body.correo, 'asdfg1234', request.body.nombre, apellidoP, apellidoM, 'A', request.body.sexo, request.body.fechaN, tel);
    participante.save()
        .then(() => {
            const usuario_rol = new Usuario_Rol(request.body.correo, '1');
            usuario_rol.save()
                .then(() => {      
                    request.session.error = undefined;
                    request.session.bandera = true; 
                    response.redirect('/gestionAdmin/gestionParticipantes')
                }).catch( err => {
                    console.log("err1");
                    console.log(err);
                    request.session.error = "Ya existe un participante registrado con el correo que ingresaste.";
                    request.session.bandera =true; 
                    response.redirect('/gestionAdmin/gestionParticipantes');  
                });
        }).catch( err => {
            console.log(err);  
        });
});

