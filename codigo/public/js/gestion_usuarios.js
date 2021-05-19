// Or with jQuery

const { fetchNomTerapeutas } = require("../../models/usuarios");

$(document).ready(function(){
    $('.modal').modal();
  });

// Or with jQuery

$(document).ready(function(){
  $('select').formSelect();
});
// jQuery date picker 
$(document).ready(function(){
  const hoy = new Date();
  const maxYear = hoy.getFullYear();
  const minYear = hoy.getFullYear()-65;
  $('.datepickerP').datepicker({ 
    format: 'yyyy-mm-dd',
    firstDay: true,
    maxDate: new Date(),
    yearRange: [minYear,maxYear], 
    container: 'body',
    //En español
    i18n: {
        cancel: 'Cancelar',
        done: 'Aceptar',
        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        weekdays: ["Domingo","Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        weekdaysShort: ["Dom","Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
        weekdaysAbbrev: ["D","L", "M", "M", "J", "V", "S"]
    }
})
});


function camposTerapeuta(opcion){
  if (opcion.value === '2'){
    document.getElementById("campoT1").style.display = "block";
    document.getElementById("campoT2").style.display = "block";
    document.getElementById("campoT3").style.display = "block";
    document.getElementById("campoT4").style.display = "block";
  }else{
    document.getElementById("campoT1").style.display = "none";
    document.getElementById("campoT2").style.display = "none";
    document.getElementById("campoT3").style.display = "none";
    document.getElementById("campoT4").style.display = "none";
  }
}

//Generar contraseña
function generarContra(){
  let especiales = ['!','#',"$","%","&","*","(",")","+","/"];
  let indice = Math.floor(Math.random() * ((9+1) - 0) + 0);
  let correo = document.getElementById("correo");
  document.getElementById("contra").value = correo.value.split('@')[0]+ new Date().getMilliseconds()+ especiales[indice];
}


const modRol = (idRol) => {

    let data = {idRol: idRol};
            fetch('/gestionAdmin/gestionUsuarios/modificar-roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(result => {
                return result.json();
                
            }).then(data => {
                console.log("Starting...");
                console.log(data);

                  let html =  '<div id="childDiv">' +
                                '<form action="/gestionAdmin/gestionUsuarios/update-roll" method="POST">' +
                                  '<table class="highlight">' +
                                    '<thead>' +
                                      '<tr>' +
                                        '<th data-field="Permisos">Permisos</th>' +
                                      '</tr>' +
                                    '</thead>' +
                                  '<tbody>';

                for (let funcion of data.funciones) {
                  if (funcion.foo == 1) {
                    html += 
                                  '<tr>' +
                                    '<td>' +
                                      '<label>' +
                                        '<input type="checkbox" checked="checked" name="Funcion_'+ funcion.idFuncion + '"/>' +
                                        '<span>' + funcion.requisitoFuncional + '</span>' +
                                      '</label>' +
                                    '</td>' +
                                  '</tr>';
                    }
                    else {
                      html += 
                                  '<tr>' +
                                    '<td>' +
                                      '<label>' +
                                        '<input type="checkbox" name="Funcion_' + funcion.idFuncion + '"/>' +
                                        '<span>' + funcion.requisitoFuncional + '</span>' +
                                      '</label>' +
                                    '</td>' +
                                  '</tr>';
                    }
                  }

                  html +=         '</tbody>' +
                                '</table>' +
                                '<input type="hidden" name="idRol" value="' + data.idRol + '">' +
                                '<div class="modal-footer">' +
                                  '<button type="submit" class="modal-action waves-effect btn-flat grey lighten-1 boton-md">Actualizar Rol</button>' +
                                '</div>' +
                              '</form>' +
                            '</div>';
                            
                  document.getElementById('despliega_Funciones').removeChild(document.getElementById("childDiv"));
                  document.getElementById('despliega_Funciones').innerHTML = html;
            }).catch(err => {
                console.log(err);
            });
};

const modUser = (login) => {

  let data = {login: login};
          fetch('/gestionAdmin/gestionUsuarios/modificar-usuario', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          }).then(result => {
              return result.json();
              
          }).then(data => {
              console.log("Starting...");
              console.log(data);

                let html =  
                            '<form action="/gestionAdmin/gestionUsuarios/update-usuario" method="POST" enctype="multipart/form-data">' +
                              '<div class="modal-content">' +
                                '<h3>Modificar usuario</h3>' +
                                '<ul>' +
                                  '<li><strong>Nombre</strong></li>'
                                  '<li>' +
                                    '<div class="input-field">' +
                                      '<input id="nombre" name="nombre" type="text" class="validate" value="' + data.usuarios[0].nombreUsuario + '" placeholder="Nombre(s)" required>' +
                                    '</div>' +
                                  '</li>' +
                                  '<li><strong><br>Apellido paterno</strong></li>' +
                                  '<li>' +
                                    '<div class="input-field">' +
                                      '<input id="apellidoP" name="apellidoP" type="text" class="validate" value="' + data.usuarios[0].apellidoPaterno + '" placeholder="Apellido paterno">' +
                                    '</div>' +
                                  '</li>' +
                                  '<li><strong><br>Apellido materno</strong></li>' +
                                  '<li>' +
                                    '<div class="input-field">' +
                                      '<input id="apellidoM" name="apellidoM" type="text" class="validate" value="' + data.usuarios[0].apellidoMaterno + '" placeholder="Apellido materno">' +
                                    '</div>' +
                                  '</li>' +
                                  '<li><strong><br>Correo</strong></li>' +
                                  '<li>' +
                                    '<div class="input-field">' +
                                      '<input id="correo" name="correo" type="email" class="validate value=""' + data.usuarios[0].login + 'placeholder="correo@mail.com" required>' +
                                      '<span class="helper-text" data-error="Introduce un correo válido"></span>'
                                    '</div>' +
                                  '</li>' +
                                  '<li><strong>Contraseña</strong></li>' +
                                  '<li>' +
                                    '<div class="input-field">' +
                                      '<input  id="contra" name= "contrasena"  type="text" class="validate" value="' + data.usuarios[0].password + '" placeholder="contraseña" required>' +
                                    '</div>' +
                                  '</li>' +
                                  '<li><strong><br>Roles</strong></li>' +
                                  '<li>' +
                                    '<div class="input-field m4" required>' +
                                      '<select name="Roles" id= "Roles" onchange="camposTerapeuta(this)" multiple required>';

                                        let i = 0;
                                        for (let rol of data.usuarios) { 
                                          if (rol.idRol != 1) { 
                                            if (usuario[i].idRol == rol){
                                              html += '<option checkbox="checked" value="' + rol.idRol + '">' + rol.nombre + '</option>';
                                            }
                                            else {
                                              html += '<option value="' + rol.idRol + '">' + rol.nombre + '</option>';
                                            }
                                          } 
                                        }
                                      
                                        html += 

                                      '</select>' +
                                      '<label>Selecciona los roles.</label>' +
                                    '</div>' +
                                  '</li>';


                                    if(tBool == true){
                                      html +=
                                        '<li style="display:none" id = "campoT1"><strong><br>Formación profesional</strong></li>' +
                                        '<li style="display:none" id = "campoT2">' +
                                          '<div class="input-field">' +
                                              '<input id="titulo" name="titulo" type="text" class="validate" value="' + data.terapeutas[0].titulo + '" placeholder="Título">' +
                                          '</div>' +
                                        '</li>' +
                                        '<li style = "display:none" id = "campoT3"><strong><br>Currículum</strong></li>' +
                                        '<li style = "display:none" id = "campoT4">' +
                                          '<div class="file-field input-field">' +
                                            '<div class="waves-effect waves-light btn-small white black-text">' +
                                              '<i class="material-icons left">file_upload</i>Subir' +
                                              '<input type="file" name="cv" href="' + data.terapeuta[0].cv + '">' +
                                            '</div>' +
                                            '<div class="file-path-wrapper">' +
                                              '<input class="file-path validate" type="text" value="' + data.terapeuta[0].curriculum + '" placeholder="Currículum">' +
                                            '</div>' +
                                            '<br>' +
                                          '</div>' +
                                        '</li>' +
                                        '<li>';
                                          if(data.terapeuta[0].estatus == 'A'){
                                            html +=
                                              '<input type="checkbox" checked="checked" name="status">';
                                          }
                                          else{
                                            html +=
                                              '<input type="checkbox" checked="checked" name="status">';
                                          }
                                          html +=
                                            '<label>Status</label>';
                                    }
                                  
                          html +=
                                '</ul>' +
                              '</div>' +
                              '<div class="modal-footer container">' +
                                '<button  type = "submit" class="modal-action waves-effect btn-flat grey lighten-1 boton-md">Actualizar</button>' +
                                '<a class="modal-trigger black-text" href="#modalEliminarU"><i class="material-icons">delete</i>Borrar Usuario</a>' +
                              '</div>' +
                              '<br>' +
                            '</form>' +
                            '<div id="modalEliminarU" class="modal">' +
                              '<div class="modal-content">' +
                                '<h4>Eliminar usuario</h4>' +
                                '<p>¿Está seguro de eliminar este usuario?</p>' +
                              '</div>' +
                              '<div class="modal-footer">' +
                                  '<a href="#" class="modal-close btn-flat eliminarU">Sí</a>' +
                                  '<a href="./"  class="modal-close waves-effect waves-green btn-flat">Cancelar</a>' +
                              '</div>' +
                            '</div>';

                          
                document.getElementById('despliega_usuario').removeChild(document.getElementById("childDiv"));
                document.getElementById('despliega_usuario').innerHTML = html;
          }).catch(err => {
              console.log(err);
          });
};