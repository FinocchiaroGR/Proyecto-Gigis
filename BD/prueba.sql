IF EXISTS (SELECT name FROM sysobjects
           WHERE name = 'crearConsultaCalif' AND type = 'P')
DROP PROCEDURE crearConsultaCalif
GO

DELIMITER $$

CREATE PROCEDURE crearConsultaCalif (
    IN `Filtrar_edad` BOOLEAN, 
    IN `Filtrar_sexo` BOOLEAN,
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT, 
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT,
    IN `Sexo` VARCHAR(1),
    IN `numProg` INT, 
    In `Programas` VARCHAR(255), 
) NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER 
BEGIN
    --Crear tabla de programas TEMP
    --SET @Programas = '\'1\',\'2\',\'4\',\'8\'';
    --CALL getProgs(@Programas);
    CALL getProgs(Programas);

    --Crear tabla temporal de datos
    IF Filtrar_edad = TRUE THEN
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos1(Ciclo_ini, Ciclo_fin, Edad_ini, Edad_fin, Sexo, Programas);
        ELSE
            CALL crearTablaTempDatos2(Ciclo_ini, Ciclo_fin, Edad_ini, Edad_fin, Programas);
        END IF;
    ELSE
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos3(Ciclo_ini, Ciclo_fin, Sexo, Programas);
        ELSE
            CALL crearTablaTempDatos4(Ciclo_ini, Ciclo_fin, Programas);
        END IF;
    END IF;

    --Asignar login como llave primaria
    ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);

    --Merge de la tabla de datos con las calificaciones
    DECLARE progCont INT DEFAULT 0;
    DECLARE cicloCont INT DEFAULT 0;
    FOR i IN 1..((Ciclo_fin-Ciclo_ini+1)*numProg) DO

        IF Calif_Ava = TRUE THEN
            CALL mergeTablaCalif_datos ((Ciclo_ini + cicloCont), (SELECT idProg FROM listProg_temp WHERE contProg = progCont+1));
        ELSE
            CALL mergeTablaAva_datos ((Ciclo_ini + cicloCont), (SELECT idProg FROM listProg_temp WHERE contProg = progCont+1));
        END IF;

        if(((progCont+1) % numProg) === 0) THEN 
            SET progCont = 0; 
            SET cicloCont = cicloCont +1;
        ELSE
            SET progCont = progCont +1;
        END IF;
    END FOR;

    DROP TEMPORARY TABLE datosPart_temp;
END
$$

DELIMITER ;             

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE getProgs (
    IN arrayProg VARCHAR(255)
) 
BEGIN 
    SET @sql = CONCAT('CREATE TEMPORARY TABLE `listProg_temp` AS SELECT * FROM Programas WHERE idPrograma IN (', arrayProg, ')'); 
    PREPARE stmt FROM @sql; 
    EXECUTE stmt; 
    DEALLOCATE PREPARE stmt; 

    ALTER TABLE `listProg_temp` ADD `contProg` INT NOT NULL AUTO_INCREMENT AFTER `idPrograma`, ADD PRIMARY KEY (`contProg`);
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos1 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT, 
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT,
    IN `Sexo` VARCHAR(1),  
    In `Programas` VARCHAR(255) 
) 
BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;
    
    CREATE TEMPORARY TABLE datosPart_temp AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos2 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT, 
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT,
    In `Programas` VARCHAR(255) 
) 
BEGIN
    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos3 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT,
    IN `Sexo` VARCHAR(1),  
    In `Programas` VARCHAR(255)
) 
BEGIN
    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos4 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT,
    In `Programas` VARCHAR(255)
)  
BEGIN
    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END
$$

DELIMITER ;

-----------------------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE mergeTablaCalif_datos (
    IN `Ciclo` INT, 
    IN `Programa` INT
)
BEGIN
    SELECT * FROM  datosPart_temp t1----La opcion parece que es concatenarla, prepararla y localizarla
    LEFT OUTER JOIN 
        (SELECT login, CalifInicial AS CONCAT('CalifInicial_P',Programa,'_C',Ciclo), CalifFinal AS CONCAT('CalifFinal_P',Programa,'_C',Ciclo)
        FROM
            CalifDatos
        WHERE
			idCiclo = Ciclo AND idPrograma = Programa) t2
    ON (t1.login = t2.login);
END
$$

DELIMITER ;

-----------------------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE mergeTablaAva_datos (
    IN `Ciclo` INT, 
    IN `Programa` INT
)
BEGIN
    SET @sql = CONCAT('Avance_P',Programa,'_C',Ciclo);

    SELECT * FROM  datosPart_temp t1
    LEFT OUTER JOIN 
        (SELECT login, Avance AS @sql
        FROM
            CalifDatos
        WHERE
			idCiclo = Ciclo AND idPrograma = Programa) t2
    ON (t1.login = t2.login);
END
$$

DELIMITER ;

CALL getProgs('1,2');
CALL crearTablaTempDatos1(10, 11, 2, 18, 'M', '1,2');

CALL getProgs('1,2');
CALL crearTablaTempDatos1(10, 11, 2, 18, 'M', '1,2');
ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);
DECLARE varTemp VARCHAR(20) DEFAULT CONCAT('Avance_P',1,'_C',10);
SELECT login, 
  Avance AS varTemp 
  FROM CalifDatos 
  WHERE idCiclo = 10 AND idPrograma = 1;