
// -------------------- Objetivos --------------------------------

const csrf = document.getElementById('_csrf').value;
const buscarObjetivo = (permisos) => {
let data = {
    criterio: document.getElementById('buscarObjetivo').value,
    nivel: document.getElementById('nivelObjetivos').value
}
fetch('/gestionAdmin/gestionProgramas/buscar-objetivo', {
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
  let i = 1;
  for (let objetivo of data.objetivos){
      if(objetivo.status === 1){
        html += '<li class="collection-item">'+
                i + '.- ' + objetivo.descripcion +
                '<span class="badge">';
                    if (permisos.includes(16)) {
                        html += '<a class="waves-effect waves-light modal-trigger black-text" href="#EditarObjetivo" onclick="obtenerIdObj(' + objetivo.idObjetivo + ')"><i class="material-icons left">edit</i></a>';
                    }
                    if (permisos.includes(19)) {
                        html += '<a class="waves-effect waves-light modal-trigger black-text" href="#modalEliminarObj" onclick="eliminarObj(' + objetivo.idObjetivo + ')"><i class="material-icons left">delete</i></a>';
                    }
                html += '</span>'+
        '</li>';
      } 
    i++;
  }
  document.getElementById('lista-objetivos').innerHTML = html;
  M.AutoInit();

}).catch(err => {
  console.log(err);
});
}

let registro_exitoso_obj = document.getElementById('registroExitosoObj').value;

if (registro_exitoso_obj !== 'false'){
    M.toast({html: registro_exitoso_obj ,  length:6500, classes: 'grey'})
}

const obtenerIdObj = (idObjetivo) => {
    html = '<input type="hidden" name="idObjetivo" value="' + idObjetivo + '">'
    document.getElementById('idObjetivo').innerHTML = html;
    M.AutoInit();
}

const eliminarObj = (idObjetivo) => {
    html = '<input type="hidden" name="idObjetivo" value="' + idObjetivo + '">'
    document.getElementById('eliminarObjetivo').innerHTML = html;
    M.AutoInit();
}
