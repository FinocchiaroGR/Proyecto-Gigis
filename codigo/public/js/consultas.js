document.addEventListener('DOMContentLoaded', function () {
    var carouselElems = document.querySelector('.carousel.carousel-slider');
        var carouselInstance = M.Carousel.init(carouselElems, {
            fullWidth: true,
            indicators: true,
            numVisible:2
        });
    });
    function moveNextCarousel() {
        var elems = document.querySelector('.carousel.carousel-slider');
        var moveRight = M.Carousel.getInstance(elems);
        moveRight.next(1);
    }
    function movePrevCarousel() {
        var elems = document.querySelector('.carousel.carousel-slider');
        var moveLeft = M.Carousel.getInstance(elems);
        moveLeft.prev(1);
    }

    M.AutoInit();
    $(document).ready(function(){
        $('select').formSelect();
        $('.js-example-basic-single').select2();
      });


var listaProg = [];

function selCard(evt) {
    if(evt.currentTarget.className.includes("blue-grey")){
        //Seleccionar programa
        evt.currentTarget.className = evt.currentTarget.className.replace(" blue-grey", " light-blue");
        listaProg.push(parseInt(evt.currentTarget.id));
        //console.table(listaProg);
    }
    else if(evt.currentTarget.className.includes("light-blue")){
        //Des-seleccionar programa
        evt.currentTarget.className = evt.currentTarget.className.replace(" light-blue", " blue-grey");
        let pos = listaProg.indexOf(evt.currentTarget.id);
        listaProg.splice(pos, 1);
        //console.table(listaProg);
    }
    if(listaProg.length > 1){
        document.getElementById('swCalifOProg').removeAttribute("disabled");
    }else{
        document.getElementById('swCalifOProg').setAttribute("disabled",null);
    }

    let data = {
        listaProg : listaProg,
    };

    fetch('/Consultas/SelProgram',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify(data)
    }).then(result => {
        return result.json();
    });
    //console.log('Hecho');
}

function todosProg(){
    tarjetProg = document.getElementsByClassName("card");
    for (i = 0; i < tarjetProg.length; i++) {
        if(tarjetProg[i].className.includes("blue-grey")){
            tarjetProg[i].className = tarjetProg[i].className.replace(" blue-grey", " light-blue");
            listaProg.push(tarjetProg[i].id);
        }
    }
    //console.table(listaProg);
    document.getElementById('swCalifOProg').removeAttribute("disabled");
    let data = {
        listaProg : listaProg,
    };

    fetch('/Consultas/SelProgram',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify(data)
    }).then(result => {
        return result.json();
    });
}

function ningunProg(){
    tarjetProg = document.getElementsByClassName("card");
    for (i = 0; i < tarjetProg.length; i++) {
        if(tarjetProg[i].className.includes("light-blue")){
            tarjetProg[i].className = tarjetProg[i].className.replace(" light-blue", " blue-grey");
            listaProg.pop();
        }
    }
    //console.table(listaProg);
    document.getElementById('swCalifOProg').setAttribute("disabled",null);
    let data = {
        listaProg : listaProg,
    };

    fetch('/Consultas/SelProgram',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify(data)
    }).then(result => {
        return result.json();
    });
}

function enableSexo(){
    let bool = document.getElementById('chSexo').checked;
    //console.log('Sexo: '+bool);
    if(bool){
        document.getElementById('swSexo').removeAttribute("disabled");
    }else{
        document.getElementById('swSexo').setAttribute("disabled",null);
    }
}

function enableEdad(){
    let bool = document.getElementById('chEdad').checked;
    //console.log('Edad: '+bool);
    if(bool){
        document.getElementById('inEdadIni').removeAttribute("disabled");
        document.getElementById('chRangoEdad').removeAttribute("disabled");
        document.getElementById('inEdadFin').removeAttribute("disabled");
    }else{
        document.getElementById('inEdadIni').setAttribute("disabled",null);
        document.getElementById('chRangoEdad').setAttribute("disabled",null);
        document.getElementById('inEdadFin').setAttribute("disabled",null);
    }
}