const registroPuntajes = (idGrupo, login) => {
    //El token de protección CSRF
    const csrf = document.getElementById('_csrf').value;
    let data = {
      grupo_id: idGrupo,
      login_participante: login
    };
    //función que manda la petición asíncrona
    fetch('/programas/objetivos-participante', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrf 
        },
        body: JSON.stringify(data)
    }).then(result => {
        return result.json(); //Regresa otra promesa
    }).then(data => {
      let html = '';
      let numeroObj = 1;
      //Header puntajes
      html ='<h6>Asignar puntajes a: ' + data.objetivos[0].nombreUsuario + ' ' + data.objetivos[0].apellidoPaterno + '</h6>' +
              '<div class="row">' +
                '<div class="col s6">' +
                  '<p><strong>Objetivos</strong></p>' +
                '</div>' +
                '<div class="col s3">' +
                  '<p><strong>Puntaje inicial</strong></p>' +
                '</div>' +
                '<div class="col s3">' +
                  '<p><strong>Puntaje final</strong></p>' +
                '</div>' +
              '</div>';
      //Registro objetivos y puntajes 
      for(objetivo of data.objetivos){
        html +=   '<div class="row">' +
                    '<div class="col s6">' +
                      '<p>' + objetivo.descripcion + '</p>' +
                    '</div>' +  
                    '<div class="col s3 input-field">' +
                      '<select id = "puntajeInicial-' + numeroObj + '">';
          
          //Asignacion de opciones para calificar puntaje inicial
          if (objetivo.puntajeInicial === null || objetivo.puntajeInicial === 0  )             
            html +=     '<option value="" disabled selected> - </option>'
          else 
            html +=     '<option value="' + objetivo.puntajeInicial + '" disabled selected> ' + objetivo.puntajeInicial + '</option>'
          for(let puntaje = 1; puntaje <= objetivo.puntajeMaximo; puntaje++){
              html +=   '<option value="' + puntaje + '"> ' + puntaje + '</option>';
          }
          html +=     '</select>' +
                    '</div>'+
                    '<div class="col s3 input-field">' +
                      '<select id = "puntajeFinal-' + numeroObj + '">';

          //Asignacion de opciones para calificar puntaje final 
          if (objetivo.puntajeFinal === null || objetivo.puntajeFinal === 0  )             
            html +=     '<option value="" disabled selected> - </option>'
          else 
            html +=     '<option value="' + objetivo.puntajeFinal + '" disabled selected> ' + objetivo.puntajeFinal + '</option>'
          for(let puntaje = 1; puntaje <= objetivo.puntajeMaximo; puntaje++){
              html +=   '<option value="' + puntaje + '"> ' + puntaje + '</option>';
          }
          html +=     '</select>' +
                    '</div>'+ 
                  '</div>';
          numeroObj++;
      }
      html +=     '<div class="row right">' +
                    '<button class="btn-formulario btn waves-effect blue lighten-1" id="guardarPuntajes">Guardar' +
                      '<i class="material-icons right">send</i>' +
                    '</button>' +
                    '<input type="hidden" value="' + data.programa[0].idPrograma + '" id="idPrograma">'
                  '</div>';
                  
      let id = 'objetivos-participante-grupo-' + data.objetivos[0].idGrupo;

      document.getElementById(id).innerHTML = html;
      M.AutoInit();

      document.getElementById("guardarPuntajes").onclick = () => {
        const objetivos = [];
        numeroObj = 1;
        function PGO(login, idGrupo, idObjetivo, pInicial, pFinal){
          this.login = login;
          this.idGrupo = idGrupo;
          this.idObjetivo = idObjetivo;
          this.pInicial = pInicial;
          this.pFinal = pFinal;
        }
        for(objetivo of data.objetivos){
          const idInicio = 'puntajeInicial-' + numeroObj;
          const idFinal = 'puntajeFinal-' + numeroObj;
          const puntajeInicial = document.getElementById(idInicio).value;
          const puntajeFinal = document.getElementById(idFinal).value;
          const participante = new PGO(data.participante, data.grupo, objetivo.idObjetivo, puntajeInicial, puntajeFinal );
          objetivos.push(participante); 
          numeroObj++;
        }
        let obj = {
          programa: document.getElementById('idPrograma').value,
          objetivos: objetivos
        } 
        fetch('/programas/registro-puntajes',{
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'csrf-token': csrf
          },
          body: JSON.stringify(obj)
        }).then(result => {
          return result.json();
        }).then (objetivos => {
          let html = '';
          let mensaje = 'Se actualizaron los puntajes de ' + objetivos.nombre[0].nombreUsuario + ' ' + objetivos.nombre[0].apellidoPaterno;
          let id = 'objetivos-participante-grupo-' + objetivos.grupo; 
          document.getElementById(id).innerHTML = html;
          M.toast({html: mensaje, classes: 'grey'}) 
        }).catch(err => {
            console.log(err);
          });
      }
    }).catch(err => {
      console.log(err);
    });
  };

const mostrarObjetivos = () => {
    const login = document.getElementById('login-participante-objetivos').value;
    const idGrupo = document.getElementById('idGrupo-participante-objetivos').value;
    const csrf = document.getElementById('_csrf').value;
    let data = {
      grupo_id: idGrupo,
      login_participante: login
    };
    //función que manda la petición asíncrona
    fetch('/programas/objetivos-participante', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrf 
        },
        body: JSON.stringify(data)
    }).then(result => {
        return result.json(); //Regresa otra promesa
    }).then(data => {
        let html = '';
        let numeroObj = 1;
        let puntajeMax = document.getElementById('puntajeMax').value;
        //Header puntajes
        html =  '<br><table class="highlight">' +
                    '<thead>' +
                      '<tr>' +
                        '<th>Objetivos</th>' +
                        '<th>Calificación</th>' +
                      '</tr>' +
                    '</thead>' +
                    '<tbody>';
                for(let objetivo of data.objetivos){
                    html +=   '<tr>' +
                                '<td>' +
                                  numeroObj + '.- ' + objetivo.descripcion + 
                                '</td>' +
                                '<td class="left-align">';
                    if(objetivo.puntajeFinal === null || objetivo.puntajeFinal === 0)  {
                        html += '-';
                    }else {
                        html += objetivo.puntajeFinal;
                    }
                    html +=    '</td>' +
                              '</tr>';
                    numeroObj++;
                  }
        html +=   '</tbody>' +
                '</table>' +
                '<br><span style="color: grey;">Nota: La calificación maxima es : ' + puntajeMax + '</span>';
        document.getElementById('objetivos-participante').innerHTML = html;
        M.AutoInit();
    
    }).catch(err => {
    console.log(err);
    });
}

if(document.getElementById('login-participante-objetivos') !== null)
    mostrarObjetivos()