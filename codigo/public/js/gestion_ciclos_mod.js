// Registro de ciclos 
let prograsSel=[], terapAsig=[];
// llamar funcion para llenar el arreglo con programas ya registrados
document.getElementById('llenarProgramas').click();
// Definir boton para  actualizar activado y desactivado
let btnDesactivado = '<a class="btn-small grey accent-4 right tooltipped" data-tooltip="Selecciona al menos un programa y asigna al menos a un terapeuta para actualizar el ciclo."><i class="material-icons left">update</i>Actualizar</a>';    
let btnActivado = '<a class="waves-effect waves-light btn-small light-green accent-4 right" onclick="enviarJSONs()"><i class="material-icons left">update</i>Actualizar</a>';
// Aparecer boton de asignar terapeutas
let countP=0, countT=0;
const  mostrarOps=(elemento) => {
   let isChecked = document.getElementById(elemento.id).checked;
   let id2 = elemento.id + 'at';
	if (isChecked){
		countP+=1;
		document.getElementById(id2).style.display = "block";
		document.getElementById("iconoExpand"+elemento.id).className = "material-icons left black-text";
		prograsSel.push(parseInt(elemento.id));
		document.getElementById("btnModCiclo").innerHTML  = countT !== 0 ? btnActivado: btnDesactivado;
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
		document.getElementById("btnModCiclo").innerHTML  = countP === 0 ? btnDesactivado: countT === 0 ? btnDesactivado: btnActivado;
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
		document.getElementById("btnModCiclo").innerHTML = btnActivado;
		M.AutoInit();
	}else{
		countT-=1;
		let pos = terapAsig.indexOf( idP);
		terapAsig.splice(pos, 1);
		document.getElementById("btnModCiclo").innerHTML  = countT === 0 ? btnDesactivado: countP === 0 ? btnDesactivado: btnActivado;
		M.AutoInit();
    }
    console.log(terapAsig);

}

//Llenar arreglo con programas que ya estaban registrados
function agregarProgramas(elemento){
    console.log(elemento);
    for(let i=0; i<elemento.length; i++){
        if(elemento[i]!=','){ 
            prograsSel.push(parseInt(elemento[i]));
        }
    }   
} 

const enviarJSONs = () => {
	const csrf = document.getElementById('_csrf').value;
	const idciclo = document.getElementById('ciclo').value;
	let data = {
		prograsSel : prograsSel,
		terapAsig: terapAsig,
        idciclo: idciclo
	};

	fetch('/gestionAdmin/gestionCiclos/editar',{
		method: 'POST',
		headers: {'Content-Type':'application/json',
				'csrf-token': csrf},
		body:JSON.stringify(data)
	}).then(result => {
	  return result.json();
	}).then(data => {
		let liga = "/gestionAdmin/gestionCiclos/inscribir/"+data.idciclo;
		window.location= liga;
	});

	
}