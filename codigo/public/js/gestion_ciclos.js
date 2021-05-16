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

  //Botones tooltips
  $(document).ready(function(){
    $('.tooltipped').tooltip();
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
let date = new Date(document.getElementById("fechaLimite").value);
// set default date for #from (1 week from today)
let nextWeekFrom = new Date(date.setDate(date.getDate() + 7));
// Default date for #to
let nextWeekTo = new Date(date.setDate(nextWeekFrom.getDate() + 14));
//Set min date for #from
let minDateFrom = new Date(document.getElementById("fechaLimite").value);
//Set min date for #to
let minDateTo = new Date(document.getElementById("fechaLimite").value);


// SET OPTIONS FOR FROM DATEPICKER
var optionsFrom = {
  format: 'yyyy-mm-dd',
	i18n: inter_es,
	minDate: new Date(minDateFrom),
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








