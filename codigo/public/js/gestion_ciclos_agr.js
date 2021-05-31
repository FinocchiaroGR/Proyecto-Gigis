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


// Registro de ciclos 
let prograsSel=[], terapAsig=[];
// Aparecer boton de asignar terapeutas
let countP=0, countT=0;
let btnDesactivado = '<a class="btn-small grey accent-4 right tooltipped" data-tooltip="Selecciona al menos un programa y asigna al menos a un terapeuta para guardar el ciclo."><i class="material-icons left">save</i>Guardar</a>';    
let btnActivado = '<a class="waves-effect waves-light btn-small light-green accent-4 right" onclick="enviarJSONs()"><i class="material-icons left">save</i>Guardar</a>';
const  mostrarOps=(elemento) => {
   let isChecked = document.getElementById(elemento.id).checked;
   let id2 = elemento.id + 'at';
	if (isChecked){
		countP+=1;
		document.getElementById(id2).style.display = "block";
		document.getElementById("iconoExpand"+elemento.id).className = "material-icons left black-text";
		prograsSel.push(parseInt(elemento.id));
		document.getElementById("btnRegCiclo").innerHTML  = countT !== 0 ? btnActivado: btnDesactivado;
		M.AutoInit();
	}else{
		tsize = Object.keys(terapAsig).length;
		let count = 0;
		for(let t= 0; t < tsize; t++){
			if(terapAsig[t-count][0].idPrograma === parseInt(elemento.id)){
				let loginv = terapAsig[t-count][0].login;
				document.getElementById(''+elemento.id+loginv).checked = false;
				terapAsig.splice(t-count, 1); 
				countT-=1;
				count+=1;
			}
		}
		countP-=1;
		document.getElementById(id2).style.display = "none";
		document.getElementById("iconoExpand"+elemento.id).className = "material-icons left grey-text text-lighten-2";
		let pos = listaProg.indexOf(elemento.id);
		prograsSel.splice(pos, 1);
		document.getElementById("btnRegCiclo").innerHTML  = countP === 0 ? btnDesactivado: countT === 0 ? btnDesactivado: btnActivado;
		M.AutoInit();

	}

}
const selTe=(terapeuta) => {
	isChecked = document.getElementById(terapeuta.id).checked;
	let idP = parseInt(terapeuta.id);
	let aux = [ {login: terapeuta.id.split(idP)[1], idPrograma: idP},];
	if (isChecked){
		countT+=1;
		terapAsig.push(aux);
		document.getElementById("btnRegCiclo").innerHTML = btnActivado;
		M.AutoInit();
	}else{
		countT-=1;
		let pos = terapAsig.indexOf( idP);
		terapAsig.splice(pos, 1);
		document.getElementById("btnRegCiclo").innerHTML  = countT === 0 ? btnDesactivado: countP === 0 ? btnDesactivado: btnActivado;
		M.AutoInit();
}

}

const enviarJSONs = () => {
	const csrf = document.getElementById('_csrf').value;
	let fechaInicial =  document.getElementById("from").value;
	let fechaFinal = document.getElementById("to").value;
	let data = {
		prograsSel : prograsSel,
		terapAsig: terapAsig,
		fechaInicial: fechaInicial,
		fechaFinal: fechaFinal
	};

	fetch('/gestionAdmin/gestionCiclos/agregar-ciclo',{
		method: 'POST',
		headers: {'Content-Type':'application/json',
				'csrf-token': csrf},
		body:JSON.stringify(data)
	}).then(result => {
	  return result.json();
	}).then(data => {
		let liga = "/gestionAdmin/gestionCiclos/inscribir/"+data.ciclo.idCiclo;
		window.location= liga;
	});

	
}





