const Arrow = require('../models/arrow');
const TableroGestion = require('../models/tablero_gestion');
const arrows = Arrow.fetchAll();
const tabGestion = TableroGestion.fetchAll();

exports.get = ((request,response,next) => {
    //1,2,3,4,6,9,10,12,13,11,16,17
    const permiso = request.session.permisos;
    const tienePermiso = permiso.includes(1) || permiso.includes(2) || permiso.includes(3) || permiso.includes(4) || permiso.includes(6) || permiso.includes(9) || permiso.includes(10) || permiso.includes(11) || permiso.includes(12) || permiso.includes(13) || permiso.includes(16) || permiso.includes(17)|| permiso.includes(20) || permiso.includes(21);
    if(tienePermiso){ 
        response.render('gestion_administrativa', {
            tabGestion: tabGestion, 
            tituloDeHeader: "Gestión Administrativa",
            tituloBarra: "Gestión administrativa",
            permisos: permiso,
            backArrow: arrows[0],
            forwArrow: arrows[1]
        });
    }
    else {
        request.session.destroy(() => {
            response.redirect('/usuarios/login'); //Este código se ejecuta cuando la sesión se elimina.
        });
    }
});
