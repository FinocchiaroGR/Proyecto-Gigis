// Or with jQuery

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
