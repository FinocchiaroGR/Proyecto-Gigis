DELIMITER $$

CREATE PROCEDURE crearConsultaCalif (
    IN `Filtrar_edad` BOOLEAN, 
    IN `Filtrar_sexo` BOOLEAN,
    IN `Calif_Ava` BOOLEAN,
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT, 
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT,
    IN `Sexo` VARCHAR(1),
    IN `numProg` INT, 
    In `Programas` VARCHAR(255) 
)
BEGIN
    #Crear tabla de programas TEMP
    CALL getProgs(Programas);

    #Crear tabla temporal de datos
    IF Filtrar_edad = TRUE THEN
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos1(Ciclo_ini, Ciclo_fin, Edad_ini, Edad_fin, Sexo);
        ELSE
            CALL crearTablaTempDatos2(Ciclo_ini, Ciclo_fin, Edad_ini, Edad_fin);
        END IF;
    ELSE
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos3(Ciclo_ini, Ciclo_fin, Sexo);
        ELSE
            CALL crearTablaTempDatos4(Ciclo_ini, Ciclo_fin);
        END IF;
    END IF;

    #Asignar login como llave primaria
    ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);

    #Merge de la tabla de datos con las calificaciones

    SET @progCont := 0; 
    SET @cicloCont := 0;
    SET @x = 0; 
    REPEAT 
        SET @x = @x + 1; 
        IF Calif_Ava = TRUE THEN
            CALL mergeTablaCalif_datos ((Ciclo_ini + @cicloCont), (SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1), @x);
        ELSE
            CALL mergeTablaAva_datos ((Ciclo_ini + @cicloCont), (SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1), @x);
        END IF;

        if(((@progCont+1) % numProg) = 0) THEN 
            SET @progCont := 0; 
            SET @cicloCont := @cicloCont +1;
        ELSE
            SET @progCont := @progCont +1;
        END IF;
    UNTIL @x >= ((Ciclo_fin-Ciclo_ini+1)*numProg) 
    END REPEAT;

    DROP TABLE IF EXISTS ultimaConsulta;

    SET @sql = CONCAT('CREATE TABLE `ultimaConsulta` AS SELECT * FROM datosPart_temp',CAST(@x AS CHAR)); 
    PREPARE stmt FROM @sql; 
    EXECUTE stmt; 
    DEALLOCATE PREPARE stmt; 
END
$$

DELIMITER ;              

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE getProgs (
    IN arrayProg VARCHAR(255)
) 
BEGIN 
    DROP TEMPORARY TABLE IF EXISTS listProg_temp;

    SET @sql = CONCAT('CREATE TEMPORARY TABLE `listProg_temp` AS SELECT * FROM programas WHERE idPrograma IN (',CAST(arrayProg AS CHAR), ')'); 
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
    IN `Sexo` VARCHAR(1) 
) 
BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;
    
    CREATE TEMPORARY TABLE datosPart_temp AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login, C.Edad_Matriculacion;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos2 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT, 
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT
)
BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login, C.Edad_Matriculacion;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos3 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT,
    IN `Sexo` VARCHAR(1)
) 
BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login, C.Edad_Matriculacion;
END
$$

DELIMITER ;

-------------------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE crearTablaTempDatos4 (
    IN `Ciclo_ini` INT, 
    IN `Ciclo_fin` INT
)  
BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login, C.Edad_Matriculacion;
END
$$

DELIMITER ;

-----------------------------------------------------------------------------------------------

DELIMITER $$

CREATE OR REPLACE PROCEDURE mergeTablaCalif_datos(IN `Ciclo` INT, IN `Programa` INT, IN `Num` INT)
BEGIN
    SET @sql = CONCAT(
            'CREATE TEMPORARY TABLE `datosPart_temp', CAST(Num AS CHAR), '` AS',
            ' SELECT t1.*, t2.CalifInicial_P',CAST(Programa AS CHAR),'_C',CAST(Ciclo AS CHAR),', t2.CalifFinal_P',CAST(Programa AS CHAR),'_C',CAST(Ciclo AS CHAR),' FROM',
            ' (SELECT * FROM  datosPart_temp', IF(Num=1,'',Num-1), ') t1',
            ' LEFT OUTER JOIN',
            ' (SELECT login, CalifInicial AS `CalifInicial_P',CAST(Programa AS CHAR),'_C',CAST(Ciclo AS CHAR),'`, CalifFinal AS `CalifFinal_P',CAST(Programa AS CHAR),'_C',CAST(Ciclo AS CHAR),'` FROM CalifDatos WHERE idCiclo = ',CAST(Ciclo AS CHAR),' AND idPrograma = ',CAST(Programa AS CHAR),')',
            ' t2 ON (t1.login = t2.login)'
        );
    PREPARE stmt FROM @sql ;
    EXECUTE stmt ;
    DEALLOCATE PREPARE stmt;
END 
$$

DELIMITER ;

-----------------------------------------------------------------------------------------------

DELIMITER $$

CREATE OR REPLACE PROCEDURE mergeTablaAva_datos(IN `Ciclo` INT, IN `Programa` INT, IN `Num` INT)
BEGIN
    SET @sql = CONCAT(
            'CREATE TEMPORARY TABLE `datosPart_temp', CAST(Num AS CHAR), '` AS',
            ' SELECT t1.*, t2.Avance_P', CAST(Programa AS CHAR), '_C', CAST(Ciclo AS CHAR),' FROM',
            ' (SELECT * FROM  datosPart_temp', IF(Num=1,'',Num-1), ') t1',
            ' LEFT OUTER JOIN',
            ' (SELECT login, Avance AS `Avance_P', CAST(Programa AS CHAR),'_C', CAST(Ciclo AS CHAR),'` FROM CalifDatos WHERE idCiclo = ',CAST(Ciclo AS CHAR),' AND idPrograma = ',CAST(Programa AS CHAR),')',
            ' t2 ON (t1.login = t2.login)'
        ) ;
    PREPARE stmt FROM @sql ;
    EXECUTE stmt ;
    DEALLOCATE PREPARE stmt;
END 
$$

DELIMITER ;

-----------------------------------------------------------------------------------------------

DELIMITER $$

CREATE OR REPLACE PROCEDURE cosultaGeneral(
    IN `Ciclo_ini` INT, 
    IN `Num` INT,
    IN `Calif_Ava` BOOLEAN,
    In `Programas` VARCHAR(255)
)
BEGIN
    #Crear tabla de programas TEMP
    CALL getProgs(Programas);
    
    SET @progCont := 0; 
    SET @cicloCont := 0;
    SET @sql = 'SELECT COUNT(*) AS `ContTotal`'; 
    SET @numProg = 'SELECT COUNT(*) FROM listProg_temp';
    SET @x = 0;
    REPEAT
        SET @x = @x + 1;
        IF Calif_Ava = TRUE THEN 
            SET @sql = CONCAT(@sql,
                            ', AVG(CalifFinal_P',
                            CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
                            '_C',
                            CAST((Ciclo_ini + @cicloCont) AS CHAR),
                            ') AS `Prom_Calif_P',
                            CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
                            '_C',
                            CAST((Ciclo_ini + @cicloCont) AS CHAR),
                            '`');
        ELSE
            SET @sql = CONCAT(@sql,
                            ', AVG(Avance_P',
                            CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
                            '_C',
                            CAST((Ciclo_ini + @cicloCont) AS CHAR),
                            ') AS `Prom_Avance_P',
                            CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
                            '_C',
                            CAST((Ciclo_ini + @cicloCont) AS CHAR),
                            '`');
        END IF;
        

        IF(((@progCont+1) % @numProg) = 0) THEN 
            SET @progCont := 0; 
            SET @cicloCont := @cicloCont +1;
        ELSE
            SET @progCont := @progCont +1;
        END IF;
    UNTIL @x >= Num 
    END REPEAT;

    SET @sql = CONCAT(@sql,' FROM ultimaconsulta');
    PREPARE stmt FROM @sql ;
    EXECUTE stmt ;
    DEALLOCATE PREPARE stmt;
END 
$$

DELIMITER ;

----------------------------------------------------------

DELIMITER $$

CREATE OR REPLACE PROCEDURE consultaGrupo (
    IN `Filtrar_edad` BOOLEAN, 
    IN `Filtrar_sexo` BOOLEAN,
    IN `grupo` INT,
    IN `Edad_ini` INT, 
    IN `Edad_fin` INT,
    IN `Sexo` VARCHAR(1)
)
BEGIN
    SET @programa = (SELECT idPrograma FROM grupos WHERE idGrupo = grupo);
    SET @Ciclo = (SELECT idCiclo FROM grupos WHERE idGrupo = grupo);

    #Crear tabla de programas TEMP
    CALL getProgs(@programa);

    #Crear tabla temporal de datos
    IF Filtrar_edad = TRUE THEN
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos1(@Ciclo, @Ciclo, Edad_ini, Edad_fin, Sexo, @programa);
        ELSE
            CALL crearTablaTempDatos2(@Ciclo, @Ciclo, Edad_ini, Edad_fin, @programa);
        END IF;
    ELSE
        IF Filtrar_sexo = TRUE THEN
            CALL crearTablaTempDatos3(@Ciclo, @Ciclo, Sexo, @programa);
        ELSE
            CALL crearTablaTempDatos4(@Ciclo, @Ciclo, @programa);
        END IF;
    END IF;

    #Asignar login como llave primaria
    ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);

    #Merge de la tabla de datos con las calificaciones y avances
    CALL mergeTablaCalif_datos (@Ciclo, @programa, 1);
    CALL mergeTablaAva_datos (@Ciclo, @programa, 2);

    DROP TABLE IF EXISTS ConsultaGrupo;
    CREATE TABLE `ConsultaGrupo` AS SELECT * FROM datosPart_temp2;
END
$$

DELIMITER ;

--------------------------------------------------

DELIMITER $$

CREATE OR REPLACE PROCEDURE consultaGenGrupo ( IN `grupo` INT )
BEGIN
    SET @programa = (SELECT idPrograma FROM grupos WHERE idGrupo = grupo);
    SET @Ciclo = (SELECT idCiclo FROM grupos WHERE idGrupo = grupo);

    SET @sql = CONCAT(
            'SELECT C.idGrupo, C.idPrograma, C.idCiclo, P.nombrePrograma, U.nombreUsuario, U.apellidoPaterno, U.apellidoMaterno,',
            ' AVG(C.CalifFinal_P', CAST(@programa AS CHAR), '_C', CAST(@Ciclo AS CHAR),') AS `Prom_CaliF`,',
            ' AVG(C.Avance_P', CAST(@programa AS CHAR), '_C', CAST(@Ciclo AS CHAR),') AS `Prom_Ava`',
            ' FROM consultagrupo C, programas P, grupos_terapeutas GT, usuarios U WHERE',
            ' C.idGrupo = GT.idGrupo AND GT.login = U.login AND P.idPrograma=C.idPrograma'
        );
    PREPARE stmt FROM @sql ;
    EXECUTE stmt ;
    DEALLOCATE PREPARE stmt;
END
$$

DELIMITER ;

----------------------------------------------------------------------------------------------

SELECT
    COUNT(*) AS `ContTotal`,
    AVG(Avance_P1_C10) AS `Prom_Avance_P1_C10`,
    AVG(Avance_P2_C10) AS `Prom_Avance_P2_C10`,
    AVG(Avance_P4_C10) AS `Prom_Avance_P4_C10`,
    AVG(Avance_P1_C11) AS `Prom_Avance_P1_C11`,
    AVG(Avance_P2_C11) AS `Prom_Avance_P2_C11`,
    AVG(Avance_P4_C11) AS `Prom_Avance_P4_C11`
FROM
    ultimaconsulta;
#Call cosultaGeneral(10,6,FALSE,'1,2,4');
CALL getProgs('1,2,4');
SET @progCont := 0;
SET @cicloCont := 0;
SET @sql = 'SELECT COUNT(*) AS `ContTotal`'; 
SET @sql = CONCAT(@sql,
       ', AVG(Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SET @progCont := @progCont +1;
	SET @sql = CONCAT(@sql,
       ', AVG(Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SET @progCont := @progCont +1;
	SET @sql = CONCAT(@sql,
       ', AVG(Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Avance_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SELECT @sql;
#Call cosultaGeneral(10,6,FALSE,'1,2,4');
CALL getProgs('1,2,4');
SET @progCont := 0;
SET @cicloCont := 0;
SET @sql = 'SELECT COUNT(*) AS `ContTotal`'; 
SET @sql = CONCAT(@sql,
       ', AVG(califFin_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Calif_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SET @progCont := @progCont +1;
	SET @sql = CONCAT(@sql,
       ', AVG(califFin_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Calif_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SET @progCont := @progCont +1;
	SET @sql = CONCAT(@sql,
       ', AVG(califFin_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       ') AS `Prom_Calif_P',
       CAST((SELECT idPrograma FROM listProg_temp WHERE contProg = @progCont+1) AS CHAR),
       '_C',
       CAST((10 + @cicloCont) AS CHAR),
       '`');
SELECT @sql;
-------------------------
CALL crearConsultaCalif (TRUE, TRUE, FALSE, 10, 11, 2, 18, 'M',3,'1,2,4')
Call cosultaGeneral(10,6,FALSE,'1,2,4')
CALL getProgs('1,2');
CALL crearTablaTempDatos1(10, 11, 2, 18, 'M', '1,2');

ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);
CALL mergeTablaCalif_datos (10, (SELECT idPrograma FROM listProg_temp WHERE contProg = 1),1);
CALL mergeTablaCalif_datos (10, (SELECT idPrograma FROM listProg_temp WHERE contProg = 2),2);

SELECT * FROM datosPart_temp;
SELECT * FROM datosPart_temp1;
SELECT * FROM datosPart_temp2;
------------------------------------------

CALL getProgs('1,2');
CALL crearTablaTempDatos1(10, 11, 2, 18, 'M', '1,2');

ALTER TABLE datosPart_temp
    ADD CONSTRAINT pk_login_partTemp
    PRIMARY KEY (login);
    
CREATE TEMPORARY TABLE `datosPart_temp1` AS
SELECT t1.*, t2.Avance_P1_C10 
FROM 
	(SELECT * FROM  datosPart_temp) t1
  LEFT OUTER JOIN
     (SELECT login, Avance AS `Avance_P1_C10` FROM CalifDatos WHERE idCiclo = 10 AND idPrograma = 1) t2
  ON (t1.login = t2.login);
  
CREATE TEMPORARY TABLE `datosPart_temp2` AS
SELECT t1.*, t2.Avance_P2_C10 
FROM 
	(SELECT * FROM  datosPart_temp1) t1
  LEFT OUTER JOIN
     (SELECT login, Avance AS `Avance_P2_C10` FROM CalifDatos WHERE idCiclo = 10 AND idPrograma = 2) t2
  ON (t1.login = t2.login);

SELECT * FROM datosPart_temp2;

----------------------------------------------------------------

CALL getProgs('1');
CALL crearTablaTempDatos4(1, 1);
SELECT * FROM datosPart_temp;
DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

CREATE TEMPORARY TABLE `datosPart_temp` AS
SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
FROM CalifDatos C 
WHERE C.idCiclo >= 1 AND C.idCiclo <= 1
    AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
GROUP BY C.login, C.Edad_Matriculacion;



SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
FROM CalifDatos C 
WHERE C.idCiclo >= 1 AND C.idCiclo <= 1
    AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
GROUP BY C.login;


CALL crearConsultaCalif (TRUE, TRUE, FALSE, 1, 1, 1, 99, 'M',1,'1');
