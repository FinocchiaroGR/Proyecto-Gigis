// -------------------- Gestion de Programas --------------------------------
let error_progra = document.getElementById('errorPrograma').value;
let registro_exitoso_progra = document.getElementById('registroExitoso').value;
if (error_progra !== 'false'){
  M.toast({html: error_progra , length:7500, classes: 'black'});
}

if (registro_exitoso_progra !== 'false'){
  M.toast({html: registro_exitoso_progra ,  length:6500, classes: 'grey'});
}

const buscarPrograma = () => {
  const csrf = document.getElementById('_csrf').value;
  let data = {criterio: document.getElementById('buscarPrograma').value}
  console.log(data)
  fetch('/gestionAdmin/gestionProgramas/buscar-programa', {
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
    for (let programa of data.programas){
      html += '<li>' +
                '<div class="collapsible-header">' +
                  programa.nombrePrograma +
                  '<span class="badge">' +
                      '<a class="waves-effect waves-light modal-trigger black-text" href="#EditarPrograma-' + programa.idPrograma + '"><i class="material-icons left">edit</i></a>' +
                  '</span>' +
                '</div>' +
              '<div class="collapsible-body">' +
                  '<div class="collection">';
                    for(let nivel of data.niveles){
                      if(nivel.idPrograma === programa.idPrograma){
      html += '<a href="./objetivos/' + nivel.idNivel + '" class="collection-item">' + nivel.nombreNivel + '</a>'; 
                      }
                    }
      html += '<a class="collection-item modal-trigger" href="#agregarNivel-' + programa.idPrograma + '">Nuevo nivel</a>'+
                  '</div>' +
              '</div>' +
          '</li>';
    }
    document.getElementById('lista-programas').innerHTML = html;
    M.AutoInit();

  }).catch(err => {
    console.log(err);
  });
}
