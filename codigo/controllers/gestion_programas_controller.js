const Objetivo = require('../models/objetivos');
const Arrow = require('../models/arrow');
const Programa = require('../models/programas');
const Nivel = require('../models/niveles');
const arrows = Arrow.fetchAll();

exports.nivelObjetivos = (request, response, next) => {
  Nivel.fetchNombrePrograma(request.params.nivel_id)
    .then(([programa,fieldData]) => {
      Objetivo.objetivosPorNivel(request.params.nivel_id)
      .then(([objetivos, fieldData2]) =>{
        const tituloBarra = programa[0].nombrePrograma + ' - Nivel: ' + programa[0].nombreNivel;
        response.render('objetivos', {
          tituloDeHeader: 'Objetivos',
          tituloBarra: tituloBarra,
          idNivel: request.params.nivel_id,
          objetivos: objetivos,
          backArrow: { display: 'block', link: '/gestionAdmin/gestionProgramas' },
          forwArrow: arrows[1],
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
};

exports.registrarObjetivo = (request, response, next) => {
  const nuevo = new Objetivo(request.body.idNivel, request.body.descripcion);
  nuevo.save()
    .then(() => {
      response.redirect('./' + request.body.idNivel);
    }).catch((err) => {
      console.log(err);
    });
};

exports.editarObjetivo  = (request, response, next) => {
  
  Objetivo.actualizarObjetivo(request.body.idNivel, request.body.idObjetivo,request.body.descripcion)
    .then(() => {
      response.redirect('./' + request.body.idNivel);
    }).catch((err) => {
      console.log(err);
    });
};

exports.eliminarObjetivo  = (request, response, next) => {
  Objetivo.eliminar(request.body.idObjetivo)
    .then(() => {
      response.redirect('./' + request.body.idNivel);
    }).catch((err) => {
      console.log(err);
    });
};

exports.get = (request, response, next) => {
  const error = request.session.error === undefined ? false : request.session.error;
  const registro_exitoso = request.session.registro_exitoso === undefined ? false : request.session.registro_exitoso;
  Programa.fetchAll()
    .then(([programas, fieldData]) => {
      Nivel.fetchAll()
        .then(([niveles, fieldData2]) => {
          response.render('gestion_programas', {
            tituloDeHeader: 'Gestión de programas',
            tituloBarra: 'Programas',
            programas: programas,
            niveles: niveles,
            error: error,
            registro_exitoso: registro_exitoso,
            backArrow: { display: 'block', link: '/gestionAdmin' },
            forwArrow: arrows[1],
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
    request.session.error = undefined;
    request.session.registro_exitoso = undefined;
};

exports.postNuevoPrograma = (request, response, next) => {
  const programa = new Programa(request.body.nombreProgra, request.body.puntajeMax,request.file.path);
  programa.save()
    .then(() => {
      Programa.fetchIdPrograma(request.body.nombreProgra)
        .then(([rows, fieldData]) => {
          const nivel = new Nivel(request.body.nivelBase, rows[0].idPrograma);
          nivel.save()
            .then(() => {
              request.session.registro_exitoso = 'El programa fue registrado correctamente.'
              response.redirect('/gestionAdmin/gestionProgramas');
            })
            .catch((err) => {
              console.log(err);
              response.redirect('/gestionAdmin/gestionProgramas');
            });
        })
        .catch((err) => {
          console.log(err);
          response.redirect('/gestionAdmin/gestionProgramas');
        });
    })
    .catch((err) => {
      request.session.error = "Ya existe un programa registrado con el nombre que ingresaste.";
      console.log(err);
      response.redirect('/gestionAdmin/gestionProgramas');
    });
};

exports.editarPrograma  = (request, response, next) => {
   if(request.body.enImagen === 'on' && request.body.enNombre === 'on'){
      Programa.editarPrograma(request.body.idPrograma, request.body.nombrePrograma, request.file.path)
      .then(() => {
        request.session.registro_exitoso = 'El programa se actualizó correctamente.'
        response.redirect('/gestionAdmin/gestionProgramas')
      }).catch((err) => {
        request.session.error = "Ya existe un programa registrado con el nombre que ingresaste.";
        console.log(err);
        response.redirect('/gestionAdmin/gestionProgramas')
      });
   } else if (request.body.enImagen === undefined && request.body.enNombre === 'on'){
      Programa.editarProgramaSinImagen(request.body.idPrograma, request.body.nombrePrograma)
      .then(() => {
        request.session.registro_exitoso = 'El programa se actualizó correctamente.'
        response.redirect('/gestionAdmin/gestionProgramas')
      }).catch((err) => {
        request.session.error = "Ya existe un programa registrado con el nombre que ingresaste.";
        console.log(err);
        response.redirect('/gestionAdmin/gestionProgramas')
      });
   } else if (request.body.enImagen === 'on' && request.body.enNombre === undefined) {
      Programa.editarProgramaSinTitulo(request.body.idPrograma, request.file.path)
      .then(() => {
        console.log('Entre al tercer if');
        request.session.registro_exitoso = 'El programa se actualizó correctamente.'
        response.redirect('/gestionAdmin/gestionProgramas')
      }).catch((err) => {
        request.session.error = "Ya existe un programa registrado con el nombre que ingresaste.";
        console.log(err);
        response.redirect('/gestionAdmin/gestionProgramas')
      });
   }
}

exports.agregarNivel = (request, response, next) => {
  const nuevoNivel = new Nivel(request.body.nombreNivel, request.body.idPrograma);
  nuevoNivel.save()
    .then(() => {
      response.redirect('./')
    }).catch((err) => {
      console.log(err);
    });
}