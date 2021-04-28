// jQuery modal
$(document).ready(function(){
    $('.modal').modal();
  });

// jQuery collap
$(document).ready(function(){
    $('.collapsible').collapsible();
  });

// jQuery select
  $(document).ready(function(){
    $('select').formSelect();
  });

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
var date = new Date();
// set default date for #from (1 week from today)
var nextWeekFrom = new Date(date.setDate(date.getDate() + 7));
// Default date for #to
var nextWeekTo = new Date(date.setDate(nextWeekFrom.getDate() + 92));
//Set min date for #to
var minDateTo = new Date(date.setDate(nextWeekFrom.getDate() + 1));


// SET OPTIONS FOR FROM DATEPICKER
var optionsFrom = {
  format: 'yyyy-mm-dd',
	i18n: inter_es,
	defaultDate: new Date(nextWeekFrom),
	setDefaultDate: true,
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

$("select").formSelect();

// Aparecer boton de asignar terapeutas
function mostrarOps(elemento){
  isChecked = document.getElementById(elemento.id).checked;
  var id2 = elemento.id + 'at';
  console.log(elemento.id) 
  if (isChecked){
    document.getElementById(id2).style.display = "block";
  }else{
    document.getElementById(id2).style.display = "none";
  }
  
}

function toastRegCiclo(){   
	M.toast({
			  html: 'Se registró correctamente el ciclo.',
			  displayLenght: 5000
			});
  }