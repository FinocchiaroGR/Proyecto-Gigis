#--STORED PROCEDURE PARA EDITAR NIVEL
#-- Creación de SP "modificanivel"
DELIMITER $$

CREATE PROCEDURE modificaNivel (
                IN `idNivelp` INT, 
                IN `nombreNivelp` VARCHAR(50) 
                )
BEGIN
    UPDATE niveles  SET nombreNivel = nombreNivelp 
                    WHERE idNivel = idNivelp;
END
$$
DELIMITER ;

#--Llamada a SP "modificanivel"
#CALL modificaNivel (7, "Nivel 1");