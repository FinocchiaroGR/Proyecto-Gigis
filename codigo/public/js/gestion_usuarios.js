

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
  document.getElementById("passwordAdd").value = correo.value.split('@')[0]+ new Date().getMilliseconds()+ especiales[indice];
}


const modRol = (idRol) => {
    const csrf = document.getElementById('_csrf').value;
    let data = {idRol: idRol};
            fetch('/gestionAdmin/gestionUsuarios/modificar-roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'csrf-token': csrf
                },
                body: JSON.stringify(data)
            }).then(result => {
                return result.json();
                
            }).then(data => {
                console.log("Starting...");
                console.log(data);

                let html =  '<div id="childDiv">' +
                                '<form action="/gestionAdmin/gestionUsuarios/update-roll" method="POST">' +
                                '<input type="hidden" id="_csrf" name="_csrf" value="' + csrf + '" >' +
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
                                '<input type="hidden" style="display:none;"  name="idRol" value="' + data.idRol + '">' +
                                '<div class="modal-footer">' +
                                  '<br><button type="submit" class="modal-action waves-effect btn-flat grey lighten-1 boton-md">Actualizar Rol</button>' +
                                '</div>' +
                              '</form>' +
                            '</div>';
                            
                  document.getElementById('despliega_Funciones').removeChild(document.getElementById("childDiv"));
                  document.getElementById('despliega_Funciones').innerHTML = html;
            }).catch(err => {
                console.log(err);
            });
};

const showPassAdd = (ico) => {
  var input = $($(ico).attr("toggle"));
  if (input.attr("type") == "password") {
      input.attr("type", "text");
      $(spanpass).html('<span toggle="#passwordAdd" class="material-icons field-icon orange-text text-darken-4" onclick="showPassAdd(this)">visibility</span>');
  } else {
      input.attr("type", "password");
      $(spanpass).html('<span toggle="#passwordAdd" class="material-icons field-icon grey-text" onclick="showPassAdd(this)">visibility_off</span>');
  }
}

const modUser = (login) => {
    const csrf = document.getElementById('_csrf').value;
    let data = {login: login};
        fetch('/gestionAdmin/gestionUsuarios/modificar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrf
            },
            body: JSON.stringify(data)
        }).then(result => {
            return result.json();  
        }).then(data => {
            let html =  
                '<form id="saveModUser" action="/gestionAdmin/gestionUsuarios/update-usuario/?_csrf=' + csrf + '" method="POST" enctype="multipart/form-data">' +
                    '<input type="hidden" id="_csrf" name="_csrf" value="' + csrf + '" >' +
                        '<div class="modal-content">' +
                            '<h3>Modificar usuario</h3><ul>' +
                                '<li><strong>Cambiar nombre</strong></li>' +
                                '<li><div class="input-field">' +
                                    '<input id="nombre" name="nombre" type="text" class="validate" value="' + data.usuarios[0].nombreUsuario + '" placeholder="Nombre(s)" required>' +
                                '</div></li>' +
                                '<li><strong><br>Cambiar apellido paterno</strong></li>' +
                                '<li><div class="input-field">';

                                    if (data.usuarios[0].apellidoPaterno != null) {
                                        html += '<input id="apellidoP" name="apellidoP" type="text" class="validate" value="' + data.usuarios[0].apellidoPaterno + '" placeholder="Apellido paterno">';
                                    }
                                    else {
                                        html += '<input id="apellidoP" name="apellidoP" type="text" class="validate" value="" placeholder="Apellido paterno">';
                                    }
                                  
                                html += '</div></li>' +
                                '<li><strong><br>Cambiar apellido materno</strong></li>' +
                                '<li><div class="input-field">';

                                    if (data.usuarios[0].apellidoMaterno != null) {
                                        html += '<input id="apellidoM" name="apellidoM" type="text" class="validate" value="' + data.usuarios[0].apellidoMaterno + '" placeholder="Apellido materno">';
                                    }
                                    else {
                                        html += '<input id="apellidoM" name="apellidoM" type="text" class="validate" value="" placeholder="Apellido materno">';
                                    }
                                  
                                html += '</div></li>' +
                                '<li><strong><br>Cambiar correo</strong></li>' +
                                '<li><div class="input-field">' +
                                    '<input id="login" name="login" type="email" class="validate" value="' + data.usuarios[0].login + '" placeholder="correo@mail.com" required>' +
                                    '<span class="helper-text" data-error="Introduce un correo válido"></span>' +
                                '</div></li>' +
                                '<li><strong>Cambiar contraseña</strong></li>' +
                                '<li><div class="input-field">' +
                                    '<input  id="passwordMod" name="password"  type="password" class="validate" value="" placeholder="Modicar contraseña">' +
                                    '<div id="spanpass"><span toggle="#passwordMod" class="material-icons field-icon grey-text" onclick="showPassMod(this)">visibility_off</span></div>' +
                                '</div></li>' +
                                '<li><strong><br>Roles</strong></li>' +
                                '<li><table style="margin:5px;">';

                                    for (let rol of data.roles) { 
                                        if (rol.idRol != 1) { 
                                            if (rol.foo == 1) {
                                                if (rol.idRol == 2) {
                                                    html +=     
                                                        '<tr id="terapeuta"><td id="childT">' +
                                                                '<label>'+
                                                                    '<input type="checkbox" checked="checked" id="alreadyCh" onclick="quitarDatosTerapeuta(this.id)" name="Rol_' + rol.idRol + '">' +
                                                                    '<span>' + rol.nombre + '</span>' +
                                                                '</label>' +
                                                            '</td></tr></div></div>'; 
                                                }
                                                else {
                                                    html +=     
                                                        '<tr><td>' +
                                                            '<label>'+
                                                                '<input type="checkbox" checked="checked" name="Rol_' + rol.idRol + '">' +
                                                                '<span>' + rol.nombre + '</span>' +
                                                            '</label>' +
                                                        '</td></tr>';
                                                }
                                                  
                                            }
                                            else {
                                                if (rol.idRol == 2) {
                                                    html +=     
                                                        '<tr id="terapeuta"><td id="childT">' +
                                                            '<label>'+
                                                                '<input type="checkbox" onclick="mostrarDatosTerapeuta()" name="Rol_' + rol.idRol + '">' +
                                                                '<span>' + rol.nombre + '</span>' +
                                                            '</label>' +
                                                        '</td></tr></div></div>';       
                                                }
                                                else {
                                                    html +=     
                                                        '<tr><td>' +
                                                            '<label>'+
                                                                '<input type="checkbox" name="Rol_' + rol.idRol + '">' +
                                                                '<span>' + rol.nombre + '</span>' +
                                                            '</label>' +
                                                        '</td></tr>';
                                                }
                                            }
                                        } 
                                    }
                                
                                html +=    '</table></li><div id="datosTerapeuta">';

                                if(data.tBool == true) {
                                    html += '<div id="childDiv1"><li><strong><br>Formación profesional</strong></li>' + 
                                            '<li><div class="input-field">';

                                    if ($.trim(data.terapeuta)) {
                                        if (data.terapeuta[0].titulo != null) {
                                            html += '<input id="titulo" name="titulo" type="text" class="validate" value="' + data.terapeuta[0].titulo + '" placeholder="Título">';
                                        }
                                        else {
                                            html += '<input id="titulo" name="titulo" type="text" class="validate" value="" placeholder="No se ha registrado un título">';
                                        }
                                        
                                    }
                                    else{
                                        html += '<input id="titulo" name="titulo" type="text" class="validate" value="" placeholder="No se ha registrado un título">';
                                    }

                                    html += '</div></li>' +
                                            '<li><strong><br>Currículum</strong></li>' +
                                                '<li><div class="file-field input-field">' +
                                                    '<div class="waves-effect waves-light btn-small white black-text">' +
                                                        '<i class="material-icons left">file_upload</i>Modificar' +
                                                        '<input type="file" name="cv">' +
                                                    '</div>';

                                    if ($.trim(data.terapeuta)) {
                                        if (data.terapeuta[0].cv != null){
                                            html +=
                                                '<div class="waves-effect waves-light btn-small white black-text">' +
                                                '   <a href="../../' + data.terapeuta[0].cv + '" target="_blank"><i class="material-icons black-text">file_download</i></a>' +
                                                '</div>';
                                        }
                                    }
                                    html += '<div class="file-path-wrapper">';


                                    if ($.trim(data.terapeuta)) {
                                        if (data.terapeuta[0].cv != null) {
                                            let fileName = data.terapeuta[0].cv.split('/');
                                            html += '<input class="file-path validate" disabled type="text" placeholder="' + fileName[2] + '">';
                                        }
                                        else {
                                            html += '<input class="file-path validate" disabled type="text" placeholder="No se ha subido ningún archivo">';
                                        }
                                        
                                    }
                                    else {
                                        html += '<input class="file-path validate" disabled type="text" placeholder="No se ha subido ningún archivo">';
                                    }

                                    html += '</div></div></li>' +
                                            '<li><strong><br>Status</strong></li>' +
                                                '<li><div class="input-field m4">' +
                                                    '<select name="estatusSelect" id="estatusSelect" required>';

                                    if ($.trim(data.terapeuta)) {
                                        if (data.terapeuta[0].estatus == 'A'){
                                            html += 
                                                '<option selected value="A">Activo</option>' +
                                                '<option value="I">Inactivo</option>' +
                                                '<option value="B">Baja permanente</option></select></div></li></div>';
                                        }
                                        else if (data.terapeuta[0].estatus == 'B') {
                                            html += 
                                                '<option value="A">Activo</option>' +
                                                '<option value="I">Inactivo</option>' +
                                                '<option selected value="B">Baja permanente</option></select></div></li></div>';
                                    
                                
                                        }
                                        else if (data.terapeuta[0].estatus == 'I') {
                                            html += 
                                                '<option value="A">Activo</option>' +
                                                '<option selected value="I">Inactivo</option>' +
                                                '<option value="B">Baja permanente/option></select></div></li></div>';
                                        }
                                    }
                                    else {
                                        html += 
                                            '<option disabled selected value="">Elige un estatus</option>' +
                                            '<option value="A">Activo</option>' +
                                            '<option value="I">Inactivo</option>' +
                                            '<option value="B">Baja permanente</option></select></div></li></div>';
                                    }
                                    
                                }
            html += 
                    '<input hidden name="lengthRoles" value="' + data.roles.length + '">' +
                    '<input hidden name="oldEmail" value="' + data.usuarios[0].login + '">' +
                    '<input hidden name="tBool" value="' + data.tBool + '">' +
                    '</div></ul></div></form>' +
                '<form id="deleteUser" action="/gestionAdmin/gestionUsuarios/eliminar-usuario" method="POST">' +
                    '<input type="hidden" id="_csrf" name="_csrf" value="' + csrf + '">' +
                    '<input hidden name="oldEmail2" value="' + data.usuarios[0].login + '">' +
                    '<input hidden name="tBool2" value="' + data.tBool + '">' +
                '</form><div class="modal-footer">' +
                    '<button type="submit" class="modal-action waves-effect btn-flat grey lighten-1 right" boton-md" style="margin:5px;" form="saveModUser">Actualizar</button>' +
                    '<button type="submit" class="modal-action waves-effect btn-flat grey lighten-1 boton-md right" style="margin:5px;" form="deleteUser" onclick="return confirm(\'¿Estás seguro de eliminar este usuario?\')">Eliminar</button>' +
                '</div>';

                    console.log(data.usuarios[0].login);
                    console.log(data.tBool);
          
          
            document.getElementById('despliega_usuario').innerHTML = html;
            M.FormSelect.init(document.getElementById('estatusSelect'));
        }).catch(err => {
            console.log(err);
        });
};

const showPassMod = (ico) => {
    var input = $($(ico).attr("toggle"));
    if (input.attr("type") == "password") {
        input.attr("type", "text");
        $(spanpass).html('<span toggle="#passwordMod" class="material-icons field-icon orange-text text-darken-4" onclick="showPassMod(this)">visibility</span>');
    } else {
        input.attr("type", "password");
        $(spanpass).html('<span toggle="#passwordMod" class="material-icons field-icon grey-text" onclick="showPassMod(this)">visibility_off</span>');
    }
}


const mostrarDatosTerapeuta = () => {

  let html =
      '<div id="childDiv1">' +
          '<li><strong><br>Formación profesional</strong></li>' +
          '<li>' +
              '<div class="input-field">' +
                  '<input id="titulo" name="titulo" type="text" class="validate" placeholder="Título">' +
              '</div>' +
          '</li>' +
          '<li><strong><br>Currículum</strong></li>' +
          '<li>' +
              '<div class="file-field input-field">' +
                  '<div class="waves-effect waves-light btn-small white black-text">' +
                      '<i class="material-icons left">file_upload</i>Subir' +
                      '<input type="file" name="cv">' +
                  '</div>' +
                  '<div class="file-path-wrapper">' +
                      '<input class="file-path validate" disabled type="text" placeholder="Currículum">' +
                  '</div><br></div></li></div>';

    document.getElementById('datosTerapeuta').innerHTML = html;
    let html2 = 
        '<td id="childT">' +
            '<label>'+
                '<input type="checkbox" checked="checked" onclick="quitarDatosTerapeuta()" name="Rol_2">' +
                '<span>terapeuta</span>' +
            '</label>' +
        '</td></tr></div>';

    document.getElementById('terapeuta').removeChild(document.getElementById("childT"));
    document.getElementById('terapeuta').innerHTML = html2;
};

const quitarDatosTerapeuta = (alreadyCh) => {

    if (window.confirm("Estas seguro/a de querrer quitarle este rol?\r\nLa información sobre este usuario terapeuta se perderá.")) {
        document.getElementById('datosTerapeuta').removeChild(document.getElementById("childDiv1"));

        let html2 = 
            '<td id="childT">' +
                '<label>'+
                    '<input type="checkbox" onclick="mostrarDatosTerapeuta()" name="Rol_2">' +
                    '<span>terapeuta</span>' +
                '</label>' +
            '</td></tr></div>';

        document.getElementById('terapeuta').removeChild(document.getElementById("childT"));
        document.getElementById('terapeuta').innerHTML = html2;
    }
    else {
        document.getElementById(alreadyCh).checked = true;
        return false
    }
 
};