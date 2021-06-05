let error = document.getElementById('error').value;
let bandera = document.getElementById('bandera').value;
if (error !== 'false' && bandera != 'false'){
  window.location="/gestionAdmin/gestionCiclos/";
}
if (error === 'false' && bandera !='false'){
  M.toast({html: bandera,  length:6500, classes: 'grey'})
}

//Despliega la lista de participantes activos
const listaParticipantes = (nombre, apellido, programa, idGrupo) => {
  let idCiclo = document.getElementById("idciclo").value;
  fetch('/gestionAdmin/gestionCiclos/participantes/'+idGrupo, {
      method: 'GET'
  }).then(result => {
      return result.json(); //Regresa otra promesa
  }).then(data => {
      //Modificamos el DOM de nuestra página de acuerdo a los datos de la segunda promesa
      let html = '<br><br><a  href= "/gestionAdmin/gestionCiclos/inscribir/'+idCiclo+'" class="waves-effect waves-light btn-small light-green accent-4 right"><i class="material-icons left">fast_forward</i>Continuar</a>'+
      '<h5><strong>'+programa+'</strong> con '+nombre+' ' +apellido+'</h5>'+
      '<div class="row">'+
        '<div class="col s12 m6 l6 ">'+
          '<table id = "tablita">'+
            '<thead>'+
              '<tr>'+
                '<div class="input-field col m11">'+
                    '<i class="material-icons prefix">search</i>'+
                    '<input id="buscarP" type="text" class="validate" oninput="buscarP(&apos;'+idGrupo+'&apos;)">'+
                '</div>'+
              '</tr>'+
            '</thead>'+
            '<tbody id = "tablita">';
            let colorPalomita = 'grey-text text-lighten-3';
            for (let participante of data.participantes) {
              let apellidoP =  participante.apellidoPaterno === null? '&nbsp;':  participante.apellidoPaterno === 'null'? '&nbsp;': participante.apellidoPaterno;
              let apellidoM =  participante.apellidoMaterno === null? '&nbsp;': participante.apellidoMaterno === 'null'? '&nbsp;': participante.apellidoMaterno;
              for (let inscrito of data.inscritos){
                if(inscrito.login === participante.login){
                  colorPalomita = 'light-green-text text-accent-4';
                }
              }
              html += '<tr>'+
                  '<td><i class="material-icons left '+colorPalomita+'" id = "paloma-'+participante.login+'" >check</i>' + participante.nombreUsuario+' ' +apellidoP+' ' + apellidoM+' ' + '</td>'+
                  '<td>'+
                    '<a  onclick="registroObjetivos(&apos;'+participante.login+'&apos;,&apos;'+idGrupo+'&apos;)" style="cursor: pointer;">'+
                      '<i class="material-icons left">chevron_right</i>'+
                    '</a>'+
                  '</td>'+
                '<tr>';
              colorPalomita = 'grey-text text-lighten-3';
            }
      html +=   '</tbody>'+
                  '</table>'+
                  '<br><br>'+
                '</div>'+
                '<div class="col s12 m6 l6">'+
                  '<div class="asignar-nivel" id="niveles-participante-'+idGrupo+'">'+
                  '</div>'+
                '</div>'+
              '</div>'+
              '<input type="hidden" id="nombreProg" value="'+ programa +'">';        
      document.getElementById('contenido').innerHTML = html;
      M.AutoInit();
  }).catch(err => {
      console.log(err);
  });
};

//Funcion para el buscador de participantes
const buscarP = (idGrupo) => {
  let criterio = document.getElementById("buscarP").value;
  fetch('/gestionAdmin/gestionCiclos/buscar/'+criterio, {
      method: 'GET'
  }).then(result => {
      return result.json(); //Regresa otra promesa
  }).then(data => {
      //Modificamos el DOM de nuestra página de acuerdo a los datos de la segunda promesa
      let html = '<tbody id = "tablita">';
      let colorPalomita = 'grey-text text-lighten-3';
      for (p of data.participante) {
        let apellidoP =  p.apellidoPaterno === 'null '? '&nbsp;':  p.apellidoPaterno === 'null'? '&nbsp;': p.apellidoPaterno;
        let apellidoM =  p.apellidoMaterno === 'null '? '&nbsp;': p.apellidoMaterno === 'null'? '&nbsp;': p.apellidoMaterno;
        for (let inscrito of data.inscritos){
          if(inscrito.login === p.login){
            colorPalomita = 'light-green-text text-accent-4';
          }
        }
        html += '<tr>'+
            '<td><i class="material-icons left '+colorPalomita+'" id = "paloma-'+p.login+'">check</i>' +p.nombreUsuario+' ' + apellidoP+' ' + apellidoM+' ' + '</td>'+
            '<td>'+
              '<a  onclick="registroObjetivos(&apos;'+p.login+'&apos;,&apos;'+idGrupo+'&apos;)" style="cursor: pointer;">'+
                '<i class="material-icons left">chevron_right</i>'+
              '</a>'+
            '</td>'+
          '<tr>';
        colorPalomita = 'grey-text text-lighten-3';
      }
      html+='</tbody>';     
      document.getElementById('tablita').innerHTML = html;
      M.AutoInit();

  }).catch(err => {
      console.log(err);
  });
};

//Sección para objetivos
const registroObjetivos = (login, idGrupo) => {
//El token de protección CSRF
const csrf = document.getElementById('_csrf').value;
let data = {
  idGrupo: idGrupo,
  login: login
};
//función que manda la petición asíncrona
fetch('/gestionAdmin/gestionCiclos/select-nivel', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrf
    },
    body: JSON.stringify(data)
}).then(result => {
    return result.json(); //Regresa otra promesa
}).then(data => {
  //Modificamos el DOM de nuestra página de acuerdo a los datos de la segunda promesa
  //...
  let html = '';
  //Header 
  html = '<div class="row">' +
          '<h6>Inscribir a: ' + data.usuarios[0].nombreUsuario +' '+data.usuarios[0].apellidoPaterno + ' ' + data.usuarios[0].apellidoMaterno  + '</h6>';
  //Registro nivel
  
    html +=   
                '<div >' +
                  '<p class="grey-text text-darken-4" ><strong>Selecciona el nivel del participante.</strong></p>' +
                '</div>' +  
                '<div class="input-field ">'+
                  '<select id = "nivelAsig-' + login+'" >'+
                    '<option value="0" disabled selected> - </option>';
                    
                    for(nivel of data.niveles){
                      html += '<option value="' + nivel.idNivel + '"> ' + nivel.nombreNivel + '</option>';
                    }
    html +=       '</select>' +
                '</div>' +  
                '<div class="asignar-ojetivos" id="objetivos-participante-grupo-'+idGrupo+'">'+
                '</div>'+
              '</div>';                
              
  let id = 'niveles-participante-' + idGrupo;
  document.getElementById(id).innerHTML = html;
  M.AutoInit();

  let idselect = 'nivelAsig-' + login;
  //Si ya está inscrito carga el nivel y objetivos registrados actualmente
  if (Object.keys(data.inscrito).length != 0){
    selectNivel = document.getElementById(idselect);
    selectNivel.options[(data.inscrito[0].idNivel-data.niveles[0].idNivel)+1].selected=true;
    let idNivelObj = data.inscrito[0].idNivel;
    M.AutoInit();
    mostrarObj(data.usuarios[0].nombreUsuario); 
  }
  
  document.getElementById(idselect).onchange = () => {
    mostrarObj(data.usuarios[0].nombreUsuario);
  }
  
  //Mostrar objetivos dependiendo del nivel seleccionado
  function mostrarObj(participante) {
      const programa = document.getElementById('nombreProg').value;
      //El token de protección CSRF
      const csrf = document.getElementById('_csrf').value;
      let idNivelObj = document.getElementById(idselect).value;
      let data2 = {
        idNivelObj: idNivelObj,
        login: login,
        idGrupo: idGrupo
      };

      //función que manda la petición asíncrona
      fetch('/gestionAdmin/gestionCiclos/mostrar-obj', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'csrf-token': csrf
          },
          body: JSON.stringify(data2)
      }).then(result => {
          return result.json(); //Regresa otra promesa
      }).then(data2 => {
        //Modificamos el DOM de nuestra página de acuerdo a los datos de la segunda promesa
        //...
        let html2 = '';
        //Header 
        html2 += 
                    '<div>'+
                      '<br><p class="grey-text text-darken-4" ><strong>Selecciona los objetivos para asignar al participante.</strong></p>'+
                    '</div>'+
                    '<table class="highlight">'+
                      '<tbody>'+
                        '<tr>'+
                          '<td class = " light-blue-text text-darken-4">Seleccionar todos los objetivos.</td>'+
                          '<td>'+
                            '<label>'+
                              '<input name ="selTodos" id="selTodos" type="checkbox" />'+ 
                              '<span>.</span>'+
                            '</label>'+  
                          '</td>'+
                        '</tr>'; 
                      let todosobj= 0;
                      let selectobj = 0;
                      let participanteInscrito = false;
                      for (let obj of data2.objetivos){ 
                        todosobj += 1;
                        if(obj.paloma === 1){
                          participanteInscrito = true;
                          selectobj += 1;
                            html2+= '<tr>'+
                              '<td>'+ obj.descripcion + '</td>'+
                              '<td>'+
                                '<label>'+
                                  '<input name ="' +obj.idObjetivo + '" checked="checked" id="' +obj.idObjetivo + '" type="checkbox" />'+ 
                                  '<span>.</span>'+
                                '</label>'+  
                              '</td>'+
                            '</tr>';
                          }
                          else {
                            html2+= '<tr>'+
                              '<td>'+ obj.descripcion + '</td>'+
                              '<td>'+
                                '<label>'+
                                  '<input name ="' +obj.idObjetivo + '" id="' +obj.idObjetivo + '" type="checkbox" />'+ 
                                  '<span>.</span>'+
                                '</label>'+  
                              '</td>'+
                            '</tr>';
                          }
                      }
              html2 += '</tbody> '+ 
                      '</table>'+
                      '<br>';
              if( participanteInscrito!=true){
                html2 += '<button class="btn-formulario btn waves-effect blue lighten-1 right" id = "inscribir">'+
                  '<i class="material-icons right">send</i>Inscribir</button>';
              }
              else{
                html2 += '<button class="btn-formulario btn waves-effect blue lighten-1 right" id = "inscribir">'+
                ' <i class="material-icons right">send</i>Actualizar</button>'+
                '<label class = "right" style="visibility:hidden">**</label>'+
                '<button class="modal-trigger btn-formulario btn blue lighten-1 right" href = "#baja">'+
                '<i class="material-icons right">delete</i>Dar de baja</button>'+
                //Modal para dar de baja en un ciclo a un participante
                '<div id="baja" class="modal">'+
                    '<div class="modal-content">'+
                      '<h5>¿Estás seguro de eliminar el registro de '+participante+' en '+programa+'? </h5>'+
                    '</div>' +
                    '<div class="modal-footer container">'+
                      '<button  class="modal-close btn-flat grey lighten-1 boton-md" id="darDeBaja">Dar de baja</button>'+
                      '             <button  class="modal-close btn-flat grey lighten-1 boton-md">Cancelar</button>               ';
                    '</div>'+
                '</div>';
              }
             
                                
              
        let id2 = "objetivos-participante-grupo-"+idGrupo;
        document.getElementById(id2).innerHTML = html2;
        M.AutoInit();
        if(selectobj === todosobj){
          document.getElementById("selTodos").checked = true;
        }

        document.getElementById("selTodos").onchange = () => {
          let isChecked =  document.getElementById("selTodos").checked;
            if(isChecked){
              for (let obj of data2.objetivos){ 
                document.getElementById(obj.idObjetivo).checked = true;
              }
            }
            else{
              for (let obj of data2.objetivos){ 
                document.getElementById(obj.idObjetivo).checked = false;
              }
            }
        }
        
      document.getElementById("inscribir").onclick = () => {
        const objetivos = [];
        function PGO(login, idGrupo, idObjetivo, idNivel){
          this.login = login;
          this.idGrupo = idGrupo;
          this.idObjetivo = idObjetivo;
          this.idNivel = idNivel;
        }
        for(let obj of data2.objetivos){
          let isChecked =  document.getElementById(obj.idObjetivo).checked;
          if(isChecked){ 
            const participante = new PGO(login, idGrupo,obj.idObjetivo, idNivelObj);
            objetivos.push(participante); 
          }
        }
        let obj = {
          objetivos: objetivos
        } 
        fetch('/gestionAdmin/gestionCiclos/inscribir',{
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'csrf-token': csrf
          },
          body: JSON.stringify(obj)
        }).then(result => {
          return result.json();
        }).then (objetivos => {
          let html = '', mensaje = '', color = '';
          if (objetivos.error === undefined){
            mensaje = objetivos.nombre[0].nombreUsuario + ' ' + objetivos.nombre[0].apellidoPaterno +' fue inscrito correctamente.';
            color = 'grey';
          }
          else{
            mensaje = objetivos.error.toString();
            color = 'black';
          }
          let id = "niveles-participante-"+objetivos.grupo; 
          document.getElementById(id).innerHTML = html;
          M.toast({html: mensaje,classes: color}) 
          document.getElementById('paloma-'+login).className = "material-icons left light-green-text text-accent-4";
          M.AutoInit();
        }).catch(err => {
          console.log(err);
        });
      }

      document.getElementById("darDeBaja").onclick = () => {
        
        let data2 = {
          login: login,
          idGrupo: idGrupo
        };
        fetch('/gestionAdmin/gestionCiclos/baja',{
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'csrf-token': csrf
          },
          body: JSON.stringify(data2)
        }).then(result => {
          return result.json();
        }).then (objetivos => {
          let html = '', mensaje = '', color = '';
          if (objetivos.error === undefined){
            mensaje = 'Se ha dado de baja a '+objetivos.nombre[0].nombreUsuario + ' ' + objetivos.nombre[0].apellidoPaterno +' del programa.';
            color = 'grey';
          }
          else{
            mensaje = objetivos.error.toString();
            color = 'black';
          }
          let id = "niveles-participante-"+objetivos.grupo; 
          document.getElementById(id).innerHTML = html;
          M.toast({html: mensaje,classes: color}) 
          document.getElementById('paloma-'+login).className = "material-icons left grey-text text-lighten-3";
          M.AutoInit();
        }).catch(err => {
          console.log(err);
        });
      }
        
      }).catch(err => {
        console.log(err);
      });

    }

}).catch(err => {
  console.log(err);
});
}

//Funcion para modificar las fechas del ciclo
const modificarFechasCiclo = () => {
  let idCiclo = document.getElementById("idciclo").value;
  fetch('/gestionAdmin/gestionCiclos/editar-ciclo/'+idCiclo, {
      method: 'GET'
  }).then(result => {
      return result.json(); //Regresa otra promesa
  }).then(data => {
      //Modificamos el DOM de nuestra página de acuerdo a los datos de la segunda promesa
      let html = '<div class="modal-content">'+
                  '<h3>Modificar el ciclo '+data.ciclonombre+'</h3>'+
                  '<ul>'+
                    '<li>'+
                      '<strong>Fecha inicial:</strong>'+
                    '</li>'+
                    '<li>'+
                      '<div class="input-field">'+
                        '<input type="text"  id="from" name="fechaInicial" class="datepickerInicial">'+
                        '<label for="from">Elige la fecha de inicio</label>'+
                      '</div>'+
                    '</li>'+
                    '<li>'+
                      '<strong>Fecha final:</strong>'+
                    '</li>'+
                    '<li>'+
                      '<div class="input-field">'+
                        '<input type="text"  id="to" name="fechaFinal" class="datepickerFinal">'+
                        '<label for="to">Elige la fecha de finalización</label>'+
                      '</div>'+
                    '</li>'+
                    '<li>';
                    
         html+=   '</ul>'+
                '</div><div class="modal-footer container">'+
                '<button  id = "actualizarCiclo" class="modal-close waves-effect btn-flat grey lighten-1 boton-md">Actualizar</button>      '+
                '<label style="visibility:hidden">**</label>'+
              '</div>'+
              '<br>';     
      document.getElementById('modalModCiclo').innerHTML = html;
      inicializarDatePickers(data);
      M.AutoInit();
      document.getElementById("modCiclo").click();

      document.getElementById("actualizarCiclo").onclick = () => {
        //El token de protección CSRF
        const csrf = document.getElementById('_csrf').value;
        let fechaInicial = document.getElementById('from').value;
        let fechaFinal = document.getElementById('to').value;
        let data = {
          fechaInicial: fechaInicial,
          fechaFinal: fechaFinal,
          idCiclo: idCiclo
        };
        fetch('/gestionAdmin/gestionCiclos/editar-ciclo',{
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'csrf-token': csrf
          },
          body: JSON.stringify(data)
        }).then(result => {
          return result.json();
        }).then (msj => {
          document.getElementById('barTitulo').innerHTML = msj.ciclonombre;
          let mensaje = '', color = '';
          if (msj.error === undefined){
            mensaje = 'Se han actualizado correctamente las fechas del ciclo.';
            color = 'grey';
          }
          else{
            mensaje = msj.error.toString();
            color = 'black';
          }
          M.toast({html: mensaje,classes: color}); 
          M.AutoInit();
        }).catch(err => {
          console.log(err);
        });
      }

  }).catch(err => {
      console.log(err);
  });
};

//Función para las fechas
function inicializarDatePickers(data){
//DATE PICKER 
// Spanish overwrite
inter_es = {
  cancel: "Cancelar",
  done: "Ok",
  months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
  ],
  monthsShort: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic"
  ],
  weekdays: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
  ],
  weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  weekdaysAbbrev: ["D", "L", "M", "M", "J", "V", "S"]
};

// Create default dates
let date = new Date(data.fechaLimite[0].fechaFinal);
// set default date for #from (1 week from today)
let nextWeekFrom = new Date(data.ciclo[0].fechaInicialF);
// Default date for #to
let nextWeekTo = new Date(data.ciclo[0].fechaFinalF);
//Set min date for #from
let minDateFrom = new Date(data.fechaLimite[0].fechaFinal);
//Set min date for #to
let minDateTo = new Date(data.fechaLimite[0].fechaFinal);

// SET OPTIONS FOR FROM DATEPICKER
var optionsFrom = {
  format: 'yyyy-mm-dd',
  i18n: inter_es,
  minDate: new Date(minDateFrom),
  defaultDate: new Date(nextWeekFrom),
  setDefaultDate: true,
  container: 'body',
  onSelect: function(el) {
    const ell = new Date(el);
    const setMM = ell.getDate() + 1;
    const setM = new Date(ell.setDate(setMM));
    setMinTo(setM);
  }
};


// SET OPTIONS FOR TO DATEPICKER
var optionsTo = {
  format: 'yyyy-mm-dd',
  i18n: inter_es,
  minDate: new Date(minDateTo),
  defaultDate: new Date(nextWeekTo),
  setDefaultDate: true,
  container: 'body',
};


// INITIATE DATEPICKERS
$(document).ready(function() {
  var $from = $("#from").datepicker(optionsFrom);
  var $to = $("#to").datepicker(optionsTo);
});


// FUNCTION TO SET MINIMUM DATE WHEN FROM DATE SELECTED
var setMinTo = function(vad) {
  // Get the current date set on #to datepicker
  var instance = M.Datepicker.getInstance($("#to"));
  instance.options.minDate = vad;

  // Check if the #from date is greater than the #to date and modify by 1 day if true.
  if (new Date(instance) < vad) {
    instance.setDate(vad);
    $("#to").val(instance.toString());
  }
};
}