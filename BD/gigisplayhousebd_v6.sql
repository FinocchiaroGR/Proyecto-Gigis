-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-06-2021 a las 17:24:14
-- Versión del servidor: 10.4.18-MariaDB
-- Versión de PHP: 7.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gigisplayhousebd_v6`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `consultaGenGrupo` (IN `grupo` INT)  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `consultaGrupo` (IN `Filtrar_edad` BOOLEAN, IN `Filtrar_sexo` BOOLEAN, IN `grupo` INT, IN `Edad_ini` INT, IN `Edad_fin` INT, IN `Sexo` VARCHAR(1))  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `cosultaGeneral` (IN `Ciclo_ini` INT, IN `Num` INT, IN `Calif_Ava` BOOLEAN, IN `Programas` VARCHAR(255))  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearConsultaCalif` (IN `Filtrar_edad` BOOLEAN, IN `Filtrar_sexo` BOOLEAN, IN `Calif_Ava` BOOLEAN, IN `Ciclo_ini` INT, IN `Ciclo_fin` INT, IN `Edad_ini` INT, IN `Edad_fin` INT, IN `Sexo` VARCHAR(1), IN `numProg` INT, IN `Programas` VARCHAR(255))  BEGIN
    #Crear tabla de programas TEMP
    CALL getProgs(Programas);

    #Crear tabla temporal de datos
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `creargrupoasignar` (IN `idGrupop` INT(11), IN `numeroGrupop` INT(11), IN `idProgramap` INT(11), IN `idCiclop` INT(11), IN `loginp` VARCHAR(50) CHARSET utf8)  INSERT INTO `grupos_terapeutas` (`idGrupo`, `login`, `fechaAsignacion`) VALUES (idGrupop, loginp, current_timestamp())$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `creargrupoasignar3` (IN `idGrupop` INT(11), IN `numeroGrupop` INT(11), IN `idProgramap` INT(11), IN `idCiclop` INT(11), IN `loginp` VARCHAR(50) CHARSET utf8)  INSERT INTO `grupos_terapeutas` (`idGrupo`, `login`, `fechaAsignacion`) VALUES (idGrupop, loginp, current_timestamp())$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `creargrupoyasignar` (IN `idGrupop` INT(11), IN `loginp` VARCHAR(50) CHARSET utf8)  INSERT INTO `grupos_terapeutas` (`idGrupo`, `login`, `fechaAsignacion`) VALUES (idGrupop, loginp, current_timestamp())$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearTablaTempDatos1` (IN `Ciclo_ini` INT, IN `Ciclo_fin` INT, IN `Edad_ini` INT, IN `Edad_fin` INT, IN `Sexo` VARCHAR(1), IN `Programas` VARCHAR(255))  BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;
    
    CREATE TEMPORARY TABLE datosPart_temp AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearTablaTempDatos2` (IN `Ciclo_ini` INT, IN `Ciclo_fin` INT, IN `Edad_ini` INT, IN `Edad_fin` INT, IN `Programas` VARCHAR(255))  BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin 
      AND C.Edad_Matriculacion >= Edad_ini AND C.Edad_Matriculacion <= Edad_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearTablaTempDatos3` (IN `Ciclo_ini` INT, IN `Ciclo_fin` INT, IN `Sexo` VARCHAR(1), IN `Programas` VARCHAR(255))  BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.sexo = Sexo
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `crearTablaTempDatos4` (IN `Ciclo_ini` INT, IN `Ciclo_fin` INT, IN `Programas` VARCHAR(255))  BEGIN
    DROP TEMPORARY TABLE IF EXISTS datosPart_temp;

    CREATE TEMPORARY TABLE `datosPart_temp` AS
    SELECT C.login, C.nombreUsuario, C.apellidoPaterno, C.apellidoMaterno, C.sexo, C.Edad_Matriculacion AS `Edad`, C.idPrograma, C.idCiclo, C.idGrupo
    FROM CalifDatos C 
    WHERE C.idCiclo >= Ciclo_ini AND C.idCiclo <= Ciclo_fin
      AND C.idPrograma IN (SELECT idPrograma FROM listProg_temp)
    GROUP BY C.login;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getProgs` (IN `arrayProg` VARCHAR(255))  BEGIN 
    DROP TEMPORARY TABLE IF EXISTS listProg_temp;

    SET @sql = CONCAT('CREATE TEMPORARY TABLE `listProg_temp` AS SELECT * FROM Programas WHERE idPrograma IN (',CAST(arrayProg AS CHAR), ')'); 
    PREPARE stmt FROM @sql; 
    EXECUTE stmt; 
    DEALLOCATE PREPARE stmt; 

    ALTER TABLE `listProg_temp` ADD `contProg` INT NOT NULL AUTO_INCREMENT AFTER `idPrograma`, ADD PRIMARY KEY (`contProg`);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `mergeTablaAva_datos` (IN `Ciclo` INT, IN `Programa` INT, IN `Num` INT)  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `mergeTablaCalif_datos` (IN `Ciclo` INT, IN `Programa` INT, IN `Num` INT)  BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `califdatos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `califdatos` (
`login` varchar(50)
,`nombreUsuario` varchar(50)
,`apellidoPaterno` varchar(50)
,`apellidoMaterno` varchar(50)
,`sexo` char(1)
,`Edad_Actual` bigint(21)
,`Edad_Matriculacion` bigint(21)
,`idGrupo` int(11)
,`idCiclo` int(11)
,`idPrograma` int(11)
,`puntajeMaximo` int(11)
,`idNivel` int(11)
,`CalifInicial` decimal(14,4)
,`CalifFinal` decimal(14,4)
,`Avance` decimal(22,8)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ciclos`
--

CREATE TABLE `ciclos` (
  `idCiclo` int(11) NOT NULL,
  `fechaInicial` DATETIME NOT NULL,
  `fechaFinal` DATETIME NOT NULL
) ;

--
-- Volcado de datos para la tabla `ciclos`
--

INSERT INTO `ciclos` (`idCiclo`, `fechaInicial`, `fechaFinal`) VALUES
(1, '2018-10-15', '2018-12-21'),
(2, '2019-01-07', '2019-03-22'),
(3, '2019-04-08', '2019-06-21'),
(4, '2019-07-15', '2019-09-30'),
(5, '2019-10-14', '2019-12-20'),
(6, '2020-01-13', '2020-03-27'),
(7, '2020-04-13', '2020-06-26'),
(8, '2020-07-13', '2020-09-25'),
(9, '2020-10-12', '2020-12-18'),
(10, '2021-01-11', '2021-03-26'),
(11, '2021-04-12', '2021-06-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `funciones`
--

CREATE TABLE `funciones` (
  `idFuncion` int(11) NOT NULL,
  `requisitoFuncional` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `funciones`
--

INSERT INTO `funciones` (`idFuncion`, `requisitoFuncional`) VALUES
(1, 'Registrar Programa'),
(2, 'Modificar Datos de Programas'),
(3, 'Inscribir Participantes'),
(4, 'Agregar Ciclo'),
(5, 'Consultar Programas'),
(6, 'Editar Participante'),
(7, 'Generar Archivo de Descarga'),
(8, 'Registrar Usuario'),
(9, 'Modificar Usuario'),
(10, 'Modificar Funciones Del Rol'),
(11, 'Modificar Ciclo'),
(12, 'Crear Rol'),
(13, 'Cambiar Rol De Usuarios'),
(14, 'Consultar Historial de Participantes'),
(15, 'Registrar Puntaje de Participante'),
(16, 'Modificar Objetivos de Niveles'),
(17, 'Eliminar Usuario'),
(18, 'Agregar Objetivos'),
(19, 'Eliminar Objetivos'),
(20, 'Registrar Participante'),
(21, 'Inscribir Participantes por Grupo Asignado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `idGrupo` int(11) NOT NULL,
  `numeroGrupo` int(11) NOT NULL,
  `idPrograma` int(11) NOT NULL,
  `idCiclo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`idGrupo`, `numeroGrupo`, `idPrograma`, `idCiclo`) VALUES
(1, 1, 1, 10),
(2, 2, 1, 10),
(3, 3, 1, 10),
(4, 4, 1, 10),
(5, 1, 2, 10),
(6, 1, 3, 10),
(7, 1, 4, 10),
(8, 1, 5, 10),
(9, 1, 6, 10),
(10, 2, 6, 10),
(11, 1, 7, 10),
(12, 2, 7, 10),
(13, 1, 8, 10),
(14, 1, 9, 10),
(15, 1, 10, 10),
(16, 1, 11, 10),
(17, 1, 12, 10),
(18, 1, 13, 10),
(19, 1, 19, 10),
(20, 1, 6, 10),
(21, 1, 2, 11),
(32, 1, 2, 11);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `grupos_programas_ciclos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `grupos_programas_ciclos` (
`nombrePrograma` varchar(50)
,`idPrograma` int(11)
,`idCiclo` int(11)
,`idGrupo` int(11)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos_terapeutas`
--

CREATE TABLE `grupos_terapeutas` (
  `idGrupo` int(11) NOT NULL,
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `fechaAsignacion` DATETIME NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `grupos_terapeutas`
--

INSERT INTO `grupos_terapeutas` (`idGrupo`, `login`, `fechaAsignacion`) VALUES
(1, 'mnajera@gigisplayhouse.org', '2021-01-08'),
(2, 'garistoy@gigisplayhouse.org', '2021-01-08'),
(3, 'mcristina@gigisplayhouse.org', '2021-01-08'),
(4, 'vsaracho@gigisplayhouse.org', '2021-01-08'),
(5, 'mnajera@gigisplayhouse.org', '2021-01-08'),
(6, 'jmartinez@gigisplayhouse.org', '2021-01-08'),
(7, 'jmartinez@gigisplayhouse.org', '2021-01-08'),
(8, 'karias@gigisplayhouse.org', '2021-01-08'),
(9, 'ptornell@gigisplayhouse.org', '2021-01-08'),
(10, 'vgarcia@gigisplayhouse.org', '2021-01-08'),
(11, 'ptornell@gigisplayhouse.org', '2021-01-08'),
(12, 'lazuara@gigisplayhouse.org', '2021-01-08'),
(13, 'ptornell@gigisplayhouse.org', '2021-01-08'),
(14, 'vgarcia@gigisplayhouse.org', '2021-01-08'),
(15, 'ccano@gigisplayhouse.org', '2021-01-08'),
(16, 'agonzalez@gigisplayhouse.org', '2021-01-08'),
(17, 'karias@gigisplayhouse.org', '2021-01-08'),
(18, 'ccano@gigisplayhouse.org', '2021-01-08'),
(19, 'mnajera@gigisplayhouse.org', '2021-01-08'),
(20, 'vgarcia@gigisplayhouse.org', '2021-01-08'),
(21, 'agonzalez@gigisplayhouse.org', '2021-05-15'),
(32, 'alondra@gmail.com', '0000-00-00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `niveles`
--

CREATE TABLE `niveles` (
  `idNivel` int(11) NOT NULL,
  `nombreNivel` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `idPrograma` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `niveles`
--

INSERT INTO `niveles` (`idNivel`, `nombreNivel`, `idPrograma`) VALUES
(1, 'prelingüístico', 1),
(2, 'básico', 1),
(3, 'intermedio', 1),
(4, 'avanzado', 1),
(5, '1', 2),
(6, '1', 3),
(7, '1', 4),
(8, '1', 5),
(9, '1', 6),
(10, '2', 6),
(11, '1', 7),
(12, '2', 7),
(13, 'básica', 8),
(14, '1', 9),
(15, '1', 10),
(16, '1', 11),
(17, '1', 12),
(18, '1', 13),
(19, '1', 19),
(20, '3', 6),
(21, '3', 7),
(22, 'Prerrequisitos', 7),
(23, 'avanzada', 8),
(24, '1', 20),
(25, '2', 9),
(26, '3', 9),
(27, '1', 14),
(28, '1', 15),
(29, '1', 16),
(30, '1', 17),
(31, '1', 18),
(32, '1', 19),
(40, 'Nivel 1', 28),
(41, '2', 2),
(43, '1', 30),
(48, 'Nivel 1', 28),
(49, 'Nivel 2', 14);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `objetivos`
--

CREATE TABLE `objetivos` (
  `idNivel` int(11) NOT NULL,
  `idObjetivo` int(11) NOT NULL,
  `descripcion` varchar(400) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `fechaRegistroObj` DATETIME NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `objetivos`
--

INSERT INTO `objetivos` (`idNivel`, `idObjetivo`, `descripcion`, `status`, `fechaRegistroObj`) VALUES
(14, 1, 'Rutina de saludo y despedida', 1, '2021-04-03'),
(14, 2, 'Sigue normas de cortesía ( pide por favor da la gracias)', 1, '2021-04-03'),
(14, 3, 'Logra permanecer  en la clase sin hacer berrinche', 1, '2021-04-03'),
(14, 4, 'Comparte sus juguetes - materiales - pertenencias', 1, '2021-04-03'),
(14, 5, 'Sigue instrucciones sencillas', 1, '2021-04-03'),
(14, 6, 'Responde cuando se le llama por su nombre', 1, '2021-04-03'),
(14, 7, 'Respetar los límites sencillos que se le ponen', 1, '2021-04-03'),
(14, 8, 'Conductas adecuadas en un contexto Se adapta sin hacer berrinche al cambio de actividad', 1, '2021-04-03'),
(14, 9, 'Logra permanecer sentado en periodos adecuados de tiempo', 1, '2021-04-03'),
(14, 10, 'Comenzar a identificar gestos  y situaciones en las que se expresan las diferentes emociones (alegria enojo tristeza)', 1, '2021-04-03'),
(14, 11, 'Ubica pictogramas de una agenda visual', 1, '2021-04-03'),
(14, 12, 'Intenta vestirse y desvestirse solo', 1, '2021-04-03'),
(14, 13, 'Tolera las dificultades', 1, '2021-04-03'),
(8, 14, 'Realiza las rutinas de cuidado personal', 1, '2021-04-05'),
(8, 15, 'Lanza y atrapa', 1, '2021-04-05'),
(8, 16, 'Organiza su mochila', 1, '2021-04-05'),
(8, 17, 'Utiliza los cubiertos', 1, '2021-04-05'),
(8, 18, 'Usa tijeras', 1, '2021-04-05'),
(17, 19, 'Elabora los productos solicitados', 1, '2021-04-05'),
(17, 20, 'Es disciplinado', 1, '2021-04-05'),
(17, 21, 'Calcula una cuenta', 1, '2021-04-05'),
(17, 22, 'Calcula el cambio de una cuenta', 1, '2021-04-05'),
(17, 23, 'Es constante', 1, '2021-04-05'),
(18, 24, 'Habla con claridad', 1, '2021-04-05'),
(18, 25, 'Mastica adecuadamente', 1, '2021-04-05'),
(18, 26, 'Mueve el cuello en círculos', 1, '2021-04-05'),
(18, 27, 'Dice trabalenguas', 1, '2021-04-05'),
(18, 28, 'Gesticula', 1, '2021-04-05'),
(5, 29, 'Fuga de dinosaurios.', 0, '2021-04-05'),
(5, 30, 'Coordina brazos', 1, '2021-04-05'),
(5, 31, 'No pisa a sus compañeros cuando baila', 1, '2021-04-05'),
(5, 32, 'Improvisa secuencias de pasos', 1, '2021-04-05'),
(5, 33, 'Marca el ritmo de la musica', 1, '2021-04-05'),
(7, 34, 'Se sienta', 1, '2021-04-05'),
(7, 35, 'Gatea', 1, '2021-04-05'),
(7, 36, 'Sostiene objetos', 1, '2021-04-05'),
(7, 37, 'Se mantiene parado', 1, '2021-04-05'),
(7, 38, 'Permanece en grupo sin llorar', 1, '2021-04-05'),
(16, 39, 'Cuenta ingredientes', 1, '2021-04-05'),
(16, 40, 'Manipula cuchillos', 1, '2021-04-05'),
(16, 41, 'Realiza mezclas homogeneas', 1, '2021-04-05'),
(16, 42, 'Manipula el fuego', 1, '2021-04-05'),
(16, 43, 'Lava los trastes y utensilios', 1, '2021-04-05'),
(6, 44, 'Estabilidad de la marcha.', 1, '2021-04-05'),
(6, 45, 'Estabilidad del equilibrio funcional.', 1, '2021-04-05'),
(6, 46, 'Fortalecimiento de miembros inferiores.', 1, '2021-04-05'),
(6, 47, 'Estabilidad de las variantes.', 1, '2021-04-05'),
(6, 48, 'Disociación de extremidades.', 1, '2021-04-05'),
(15, 49, 'Realiza el recorrido de obstaculos', 1, '2021-04-05'),
(15, 50, 'Se columpia', 1, '2021-04-05'),
(15, 51, 'Acomoda los conos', 1, '2021-04-05'),
(15, 52, 'Acomoda los bloques', 1, '2021-04-05'),
(15, 53, 'Arma el rompecabezas', 1, '2021-04-05'),
(1, 54, 'Balbucea', 1, '2021-04-05'),
(1, 55, 'Emite ruidos con su garganta', 1, '2021-04-05'),
(1, 56, 'Hace pequeños ruidos cuando se le habla', 1, '2021-04-05'),
(1, 57, 'Crea sonidos relacionados con el placer y el dolor', 1, '2021-04-05'),
(1, 58, 'Sensibilidad ante el ruido', 1, '2021-04-05'),
(2, 59, 'Pronuncia vocales', 1, '2021-04-05'),
(2, 60, 'Comprende la palabra no', 1, '2021-04-05'),
(2, 61, 'Conoce y responde a su nombre', 1, '2021-04-05'),
(2, 62, 'Disfruta con las canciones', 1, '2021-04-05'),
(2, 63, 'Surge el laleo que son sonidos vocalicos y consonanticos', 1, '2021-04-05'),
(3, 64, 'Construye frases simples', 1, '2021-04-05'),
(3, 65, 'Responde a preguntas sencillas mediante lenguaje no verbal', 1, '2021-04-05'),
(3, 66, 'Aparecen las holofrases', 1, '2021-04-05'),
(3, 67, 'Intenta imitar palabras sencillas', 1, '2021-04-05'),
(3, 68, 'Emite onomatopeyas', 1, '2021-04-05'),
(4, 69, 'Mantiene la interaccion con el otro', 1, '2021-04-05'),
(4, 70, 'Conjuga verbos', 1, '2021-04-05'),
(4, 71, 'Utiliza el singular y plural', 1, '2021-04-05'),
(4, 72, 'Sigue cuentos largos', 1, '2021-04-05'),
(4, 73, 'Entiende cualquier mensaje verbal', 1, '2021-04-05'),
(19, 74, 'Puede agrupar objetos por familias', 1, '2021-04-05'),
(19, 75, 'Es capaz de describir objetos comunes', 1, '2021-04-05'),
(19, 76, 'Expresa ideas y sentimientos', 1, '2021-04-05'),
(19, 77, 'Responde a preguntas sencillas', 1, '2021-04-05'),
(19, 78, 'Usa los sonidos del habla correctamente', 1, '2021-04-05'),
(9, 79, 'Identifica las letras', 1, '2021-04-05'),
(9, 80, 'Sabe el abecedario', 1, '2021-04-05'),
(9, 81, 'Identifica los sonidos de las letras', 1, '2021-04-05'),
(9, 82, 'Identifica el sonido de silabas', 1, '2021-04-05'),
(9, 83, 'Asocia palabras con objetos', 1, '2021-04-05'),
(10, 84, 'Lee palabras completas', 1, '2021-04-05'),
(10, 85, 'Identifica los signos de puntacion', 1, '2021-04-05'),
(10, 86, 'Responde preguntas sencillas de la lectura', 1, '2021-04-05'),
(10, 87, 'Resume la lectura', 1, '2021-04-05'),
(10, 88, 'Lee oraciones completas respetando signos de puntuacion', 1, '2021-04-05'),
(20, 89, 'Lee cuentos completos', 1, '2021-04-05'),
(20, 90, 'Lee entre lineas', 1, '2021-04-05'),
(20, 91, 'Lee con ritmo', 1, '2021-04-05'),
(20, 92, 'Puede inferir el significado de una palabra por su contexto', 1, '2021-04-05'),
(20, 93, 'Identifica ideas principales por parrafos', 1, '2021-04-05'),
(13, 94, 'Escribe su nombre completo', 1, '2021-04-05'),
(13, 95, 'Escribe todo el abecedario', 1, '2021-04-05'),
(13, 96, 'Escribe lo que se le dicta', 1, '2021-04-05'),
(13, 97, 'Escribe palabras por deletreo', 1, '2021-04-05'),
(13, 98, 'Identifica la silaba tonica de las palabras', 1, '2021-04-05'),
(11, 99, 'Puede caminar en linea recta', 1, '2021-04-05'),
(11, 100, 'Puede mantener distancia dentro de una fila', 1, '2021-04-05'),
(11, 101, 'Tiene buen equilibrio', 1, '2021-04-05'),
(11, 102, 'Puede mantener un baso de agua sin distraerse', 1, '2021-04-05'),
(11, 103, 'Puede comer sin que se le caiga la comida', 1, '2021-04-05'),
(12, 104, 'Sabe contar hasta un millon', 1, '2021-04-05'),
(12, 105, 'Realiza multiplicaciones de un digito', 1, '2021-04-05'),
(12, 106, 'Realiza restas de numeros de un digito', 1, '2021-04-05'),
(12, 107, 'Realiza multiplicaciones de dos dígitos', 1, '2021-04-05'),
(12, 108, 'Entiende la diferencia entre unidades decenas y centenas', 1, '2021-04-05'),
(21, 109, 'Realiza divisiones simples', 1, '2021-04-05'),
(21, 110, 'Entiendan el concepto de cantidades fraccionarias', 1, '2021-04-05'),
(21, 111, 'Sabe hacer sumas y restas entre fracciones', 1, '2021-04-05'),
(21, 112, 'Entiende problemas basicos de aritmetica y propone soluciones', 1, '2021-04-05'),
(21, 113, 'Puede interpretar situaciones de la vida cotidiana como problemas matematicos', 1, '2021-04-05'),
(22, 114, 'Diferencia los numeros entre sí', 1, '2021-04-05'),
(22, 115, 'Entiende el concepto de cantidad y lo relaciona con un numero', 1, '2021-04-05'),
(22, 116, 'Puede interpretar textos que hablen de cantidades', 1, '2021-04-05'),
(22, 117, 'Realiza sumas de un digito', 1, '2021-04-03'),
(22, 118, 'Sabe contar hasta el cien', 1, '2021-04-03'),
(23, 119, 'Puede leer 100 palabras por minuto', 1, '2021-04-03'),
(23, 120, 'Puede leer 120 palabras por minuto', 1, '2021-04-03'),
(23, 121, 'Puede diferenciar entre la S y la C', 1, '2021-04-03'),
(23, 122, 'Puede distinguir donde usar la H', 1, '2021-04-03'),
(23, 123, 'Puede entender lecturas mas complicadas', 1, '2021-04-03'),
(24, 124, 'Puede distinguir las letras de un texto', 1, '2021-04-03'),
(24, 125, 'Puede distiguir palabras de un texto', 1, '2021-04-03'),
(24, 126, 'Puede formar montañas de caligrafia', 1, '2021-04-03'),
(24, 127, 'Puede distinguir lo que falta en una figura más sencilla y completarlo', 1, '2021-04-03'),
(24, 128, 'Puede distinguir lo que falta en una figura más complicada y completarlo', 1, '2021-04-03'),
(25, 129, 'Capacidad para percibir y comprender el punto de vista de los demás', 1, '2021-04-03'),
(25, 130, 'Aceptación adecuada de las críticas', 1, '2021-04-05'),
(25, 131, 'Comportamiento democrático en situaciones de grupo', 1, '2021-04-05'),
(25, 132, 'Habilidad para pedir la información que precise o solicitar ayuda', 1, '2021-04-05'),
(25, 133, 'Percepción de las interacciones sociales desde diferentes perspectivas', 1, '2021-04-05'),
(26, 134, 'Se prestará especial atención a los saludos y despedidas en todas las situaciones y a la utilización de por favor y de gracias cuando se solicita algo (normas de cortesía básica)', 1, '2021-04-05'),
(26, 135, 'Autopercepción y percepción en los demás de los elementos fundamentales del lenguaje corporal', 1, '2021-04-05'),
(26, 136, 'Saluda de forma adecuada a distintas personas de su entorno social. Se despide correctamente', 1, '2021-04-05'),
(26, 137, 'Se presenta y presenta a sus acompañantes en las situaciones adecuadas', 1, '2021-04-05'),
(26, 138, 'Muestra la conducta adecuada ante las personas que le insultan y ofenden', 1, '2021-04-05'),
(27, 139, 'Controlar la correcta colocación del cuerpo', 1, '2021-04-05'),
(27, 140, 'Lograr dominio en la coordinación y desarrollo de todos los movimientos', 1, '2021-04-05'),
(27, 141, 'Ejecutar con musicalidad los movimientos que configuran la danza', 1, '2021-04-05'),
(27, 142, 'Aplicar los conocimientos técnicos y estilísticos adquiridos', 1, '2021-04-05'),
(27, 143, 'Conseguir la calidad del movimiento necesaria para alcanzar el máximo grado de interpretación artística', 1, '2021-04-05'),
(28, 144, 'Capacidad de concentrarse en estímulos visuales', 1, '2021-04-05'),
(28, 145, 'Presenta necesidad de la comunicación oral', 1, '2021-04-05'),
(28, 146, 'Condiciona patrones adecuados de conducta', 1, '2021-04-05'),
(28, 147, 'Socialización y empatia', 1, '2021-04-05'),
(28, 148, 'Promueve la integración al grupo', 1, '2021-04-05'),
(29, 149, 'Lanzamiento a canasta', 1, '2021-04-05'),
(29, 150, 'Pases con un balón de fútbol con los pies', 1, '2021-04-05'),
(29, 151, 'Pases con un balón de baloncesto con las manos', 1, '2021-04-05'),
(29, 152, 'Puede botar un balon libremente', 1, '2021-04-05'),
(29, 153, 'Puede usar la ejecución técnica del acto motriz', 1, '2021-04-05'),
(30, 154, 'Puede caminar con postura correcta', 1, '2021-04-05'),
(30, 155, 'Al estar de pie sus pies miran alfrente', 1, '2021-04-05'),
(30, 156, 'Puede mantener la cabeza mirando hacia el frente', 1, '2021-04-05'),
(30, 157, 'Al estar parado no presenta hiperextension de rodilla', 1, '2021-04-05'),
(30, 158, 'Puede estirar diferentes partes del cuerpo', 1, '2021-04-05'),
(31, 159, 'Guarda conexiones sistemáticas con lo que no es juego', 1, '2021-04-05'),
(31, 160, 'Se da cuenta del mundo exterior y de sí mismo', 1, '2021-04-05'),
(31, 161, 'Cooperacion en equipo', 1, '2021-04-05'),
(31, 162, 'Flexibidad para resolver problemas', 1, '2021-04-05'),
(31, 163, 'Puede realizar un kime sin problemas', 1, '2021-04-05'),
(5, 164, 'Fuga de dinosaurios.', 1, '2021-05-12'),
(5, 165, 'Escribe.', 1, '2021-05-17'),
(5, 166, 'Correr y brincar.', 1, '2021-05-18'),
(5, 167, 'Camina.', 0, '2021-05-19'),
(5, 168, 'Bicicleta.', 1, '2021-05-19'),
(5, 169, 'Coordina muy bien.', 1, '2021-05-31'),
(6, 170, 'Seguimiento de instrucciones sencillas.', 1, '2021-06-01'),
(6, 171, 'Atención mínima entre 5 y 10 segundos.', 1, '2021-06-01'),
(6, 172, 'Contacto visual.', 1, '2021-06-01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participantes`
--

CREATE TABLE `participantes` (
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `estatus` char(1) COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'A',
  `sexo` char(1) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `fechaNacimiento` DATETIME NOT NULL,
  `telefonoPadre` varchar(12) COLLATE utf8mb4_spanish2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `participantes`
--

INSERT INTO `participantes` (`login`, `estatus`, `sexo`, `fechaNacimiento`, `telefonoPadre`) VALUES
('andreascvfg@correo.com', 'A', 'M', '2000-05-04', NULL),
('correo001', 'A', 'M', '2014-01-13', NULL),
('correo002', 'A', 'H', '2016-07-31', NULL),
('correo003', 'A', 'H', '1993-10-11', NULL),
('correo004', 'A', 'M', '2002-05-25', NULL),
('correo005', 'A', 'H', '2018-07-30', NULL),
('correo006', 'A', 'M', '1994-01-26', NULL),
('correo007', 'A', 'M', '2003-06-18', NULL),
('correo008', 'A', 'M', '2013-01-22', NULL),
('correo009', 'A', 'M', '2013-04-10', NULL),
('correo010', 'A', 'H', '2001-04-19', NULL),
('correo011', 'A', 'H', '2000-09-21', NULL),
('correo012', 'A', 'M', '2010-02-28', NULL),
('correo013', 'A', 'M', '2020-09-15', NULL),
('correo014', 'A', 'M', '1998-01-04', NULL),
('correo015', 'A', 'H', '2007-06-16', NULL),
('correo016', 'A', 'H', '2019-04-18', NULL),
('correo017', 'A', 'H', '2016-11-03', NULL),
('correo018', 'A', 'H', '2013-12-06', NULL),
('correo019', 'A', 'H', '2012-07-14', NULL),
('correo020', 'A', 'M', '2014-10-21', NULL),
('correo021', 'A', 'H', '2018-01-15', NULL),
('correo022', 'A', 'H', '2008-04-05', NULL),
('correo023', 'A', 'H', '2012-11-11', NULL),
('correo024', 'A', 'M', '2014-09-19', NULL),
('correo025', 'A', 'M', '2019-02-13', NULL),
('correo026', 'A', 'M', '2008-08-22', NULL),
('correo027', 'A', 'H', '2002-04-05', NULL),
('correo028', 'A', 'H', '2008-12-18', NULL),
('correo029', 'A', 'H', '1996-04-18', NULL),
('correo030', 'A', 'M', '1998-06-21', NULL),
('correo031', 'A', 'M', '2015-07-31', NULL),
('correo032', 'A', 'H', '2017-04-28', NULL),
('correo033', 'A', 'H', '2005-10-18', NULL),
('correo034', 'A', 'H', '2014-07-21', NULL),
('correo035', 'A', 'H', '2007-11-13', NULL),
('correo037', 'A', 'H', '2012-11-24', NULL),
('correo038', 'A', 'M', '2013-10-10', NULL),
('correo039', 'A', 'H', '2017-07-21', NULL),
('correo040', 'A', 'H', '2018-06-17', NULL),
('correo041', 'A', 'H', '1992-07-20', NULL),
('correo042', 'A', 'M', '2011-08-24', NULL),
('correo043', 'A', 'H', '2020-02-12', NULL),
('correo044', 'A', 'H', '2018-06-26', NULL),
('correo045', 'A', 'H', '2008-01-02', NULL),
('correo046', 'A', 'M', '2017-03-05', NULL),
('correo047', 'A', 'H', '2012-01-04', NULL),
('correo048', 'A', 'H', '2009-03-26', NULL),
('correo049', 'A', 'M', '2016-08-20', NULL),
('correo050', 'A', 'H', '2015-05-10', NULL),
('correo051', 'A', 'H', '2011-11-02', NULL),
('correo052', 'A', 'M', '2018-06-17', NULL),
('correo053', 'A', 'H', '2007-02-08', NULL),
('correo054', 'A', 'M', '2016-07-30', NULL),
('correo055', 'A', 'M', '2018-09-12', NULL),
('correo056', 'A', 'H', '2018-12-08', NULL),
('correo057', 'A', 'H', '2018-06-30', NULL),
('correo058', 'A', 'H', '2006-08-24', NULL),
('correo059', 'A', 'H', '2003-06-06', NULL),
('correo060', 'A', 'M', '2011-02-02', NULL),
('correo061', 'A', 'H', '2016-06-16', NULL),
('correo062', 'A', 'M', '1998-08-19', NULL),
('correo063', 'A', 'M', '1998-05-27', NULL),
('correo064', 'A', 'M', '2019-05-02', NULL),
('correo065', 'A', 'M', '1999-05-28', NULL),
('correo066', 'A', 'H', '2009-04-19', NULL),
('correo067', 'A', 'H', '2019-11-09', NULL),
('correo068', 'A', 'H', '2013-08-30', NULL),
('correo069', 'A', 'H', '2020-10-11', NULL),
('correo070', 'A', 'H', '2011-09-10', NULL),
('correo071', 'A', 'H', '2015-07-10', NULL),
('correo072', 'A', 'M', '2001-10-08', NULL),
('correo073', 'A', 'M', '2013-02-11', NULL),
('correo074', 'A', 'M', '2007-03-16', NULL),
('correo075', 'A', 'M', '2005-08-29', NULL),
('correo076', 'A', 'H', '2020-08-27', NULL),
('correo077', 'A', 'H', '2020-07-07', NULL),
('correo078', 'A', 'H', '2019-02-27', NULL),
('correo079', 'A', 'M', '2012-09-19', NULL),
('correo080', 'A', 'M', '2015-12-08', NULL),
('correo081', 'A', 'M', '2011-05-27', NULL),
('correo082', 'A', 'M', '2017-06-07', NULL),
('correo083', 'A', 'H', '2019-01-18', NULL),
('correo084', 'A', 'H', '2004-03-01', NULL),
('correo085', 'A', 'M', '2011-08-26', NULL),
('correo086', 'A', 'M', '2017-06-02', NULL),
('correo087', 'A', 'H', '2013-10-28', NULL),
('correo088', 'A', 'H', '2004-02-14', NULL),
('correo089', 'A', 'H', '2008-01-06', NULL),
('correo090', 'A', 'H', '2019-12-25', NULL),
('correo091', 'A', 'M', '1999-03-24', NULL),
('correo092', 'A', 'M', '2008-06-12', NULL),
('correo093', 'A', 'M', '2010-10-05', NULL),
('correo094', 'A', 'M', '2020-08-14', NULL),
('correo095', 'A', 'M', '2013-09-01', NULL),
('correo096', 'A', 'M', '2020-03-01', NULL),
('correo097', 'A', 'H', '2001-08-03', NULL),
('correo098', 'A', 'M', '2020-03-12', NULL),
('correo099', 'A', 'H', '2017-07-16', NULL),
('correo100', 'A', 'H', '2018-10-07', NULL),
('correo101', 'A', 'M', '2015-12-22', NULL),
('correo102', 'A', 'M', '2015-12-07', NULL),
('correo103', 'A', 'M', '2011-10-03', NULL),
('sandratello', 'A', 'H', '2000-07-20', '9511912719'),
('sandy', 'A', 'M', '2021-05-13', NULL),
('sandyts', 'A', 'M', '2008-07-19', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participantes_grupos_objetivo`
--

CREATE TABLE `participantes_grupos_objetivo` (
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `idGrupo` int(11) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `idObjetivo` int(11) NOT NULL,
  `puntajeInicial` int(11) DEFAULT NULL,
  `puntajeFinal` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `participantes_grupos_objetivo`
--

INSERT INTO `participantes_grupos_objetivo` (`login`, `idGrupo`, `idNivel`, `idObjetivo`, `puntajeInicial`, `puntajeFinal`) VALUES
('andreascvfg@correo.com', 2, 2, 59, NULL, NULL),
('andreascvfg@correo.com', 2, 2, 60, NULL, NULL),
('andreascvfg@correo.com', 2, 2, 61, NULL, NULL),
('andreascvfg@correo.com', 2, 2, 62, NULL, NULL),
('andreascvfg@correo.com', 2, 2, 63, NULL, NULL),
('andreascvfg@correo.com', 3, 4, 69, NULL, NULL),
('andreascvfg@correo.com', 3, 4, 70, NULL, NULL),
('andreascvfg@correo.com', 3, 4, 71, NULL, NULL),
('andreascvfg@correo.com', 3, 4, 72, NULL, NULL),
('andreascvfg@correo.com', 3, 4, 73, NULL, NULL),
('andreascvfg@correo.com', 4, 1, 54, NULL, NULL),
('andreascvfg@correo.com', 4, 1, 55, NULL, NULL),
('andreascvfg@correo.com', 4, 1, 56, NULL, NULL),
('andreascvfg@correo.com', 4, 1, 57, NULL, NULL),
('andreascvfg@correo.com', 4, 1, 58, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 29, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 30, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 31, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 32, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 33, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 164, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 165, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 166, NULL, NULL),
('andreascvfg@correo.com', 21, 5, 168, NULL, NULL),
('andreascvfg@correo.com', 32, 5, 29, 2, 2),
('andreascvfg@correo.com', 32, 5, 30, 3, 0),
('andreascvfg@correo.com', 32, 5, 31, 4, 0),
('andreascvfg@correo.com', 32, 5, 32, 0, 0),
('andreascvfg@correo.com', 32, 5, 33, 0, 0),
('andreascvfg@correo.com', 32, 5, 164, 0, 0),
('andreascvfg@correo.com', 32, 5, 165, 0, 0),
('andreascvfg@correo.com', 32, 5, 166, 0, 0),
('andreascvfg@correo.com', 32, 5, 168, 0, 0),
('correo001', 1, 2, 60, NULL, NULL),
('correo001', 1, 2, 61, NULL, NULL),
('correo001', 2, 2, 59, NULL, NULL),
('correo001', 2, 2, 60, NULL, NULL),
('correo001', 2, 2, 61, NULL, NULL),
('correo001', 2, 2, 62, NULL, NULL),
('correo001', 2, 2, 63, NULL, NULL),
('correo001', 9, 9, 79, 2, 2),
('correo001', 9, 9, 80, 1, 2),
('correo001', 9, 9, 81, 2, 2),
('correo001', 9, 9, 82, 3, 3),
('correo001', 9, 9, 83, 2, 2),
('correo001', 11, 11, 99, 1, 2),
('correo001', 11, 11, 100, 2, 4),
('correo001', 11, 11, 101, 1, 1),
('correo001', 11, 11, 102, 3, 4),
('correo001', 11, 11, 103, 3, 4),
('correo002', 7, 7, 34, 3, 3),
('correo002', 7, 7, 35, 2, 3),
('correo002', 7, 7, 36, 2, 4),
('correo002', 7, 7, 37, 2, 4),
('correo002', 7, 7, 38, 1, 1),
('correo002', 16, 16, 39, 2, 4),
('correo002', 16, 16, 40, 1, 1),
('correo002', 16, 16, 41, 1, 2),
('correo002', 16, 16, 42, 2, 2),
('correo002', 16, 16, 43, 1, 3),
('correo002', 32, 5, 29, 1, 2),
('correo002', 32, 5, 30, 2, 3),
('correo002', 32, 5, 31, 3, 2),
('correo002', 32, 5, 32, 2, 1),
('correo002', 32, 5, 164, 3, 4),
('correo002', 32, 5, 165, 1, 1),
('correo002', 32, 5, 166, 5, 5),
('correo002', 32, 5, 168, 3, 4),
('correo003', 16, 16, 39, 1, 2),
('correo003', 16, 16, 40, 1, 4),
('correo003', 16, 16, 41, 1, 2),
('correo003', 16, 16, 42, 3, 3),
('correo003', 16, 16, 43, 2, 2),
('correo005', 1, 1, 54, 2, 1),
('correo005', 1, 1, 55, 3, 4),
('correo005', 1, 1, 56, 2, 2),
('correo005', 1, 1, 57, 1, 5),
('correo005', 1, 1, 58, 2, 2),
('correo005', 2, 2, 59, NULL, NULL),
('correo005', 2, 2, 60, NULL, NULL),
('correo005', 2, 2, 61, NULL, NULL),
('correo005', 2, 2, 62, NULL, NULL),
('correo005', 2, 2, 63, NULL, NULL),
('correo005', 7, 7, 34, 2, 2),
('correo005', 7, 7, 35, 2, 2),
('correo005', 7, 7, 36, 2, 2),
('correo005', 7, 7, 37, 2, 3),
('correo005', 7, 7, 38, 3, 4),
('correo005', 15, 15, 49, 3, 3),
('correo005', 15, 15, 50, 1, 1),
('correo005', 15, 15, 51, 2, 2),
('correo005', 15, 15, 52, 2, 2),
('correo005', 15, 15, 53, 1, 3),
('correo006', 4, 4, 69, 1, 2),
('correo006', 4, 4, 70, 3, 3),
('correo006', 4, 4, 71, 1, 3),
('correo006', 4, 4, 72, 2, 2),
('correo006', 4, 4, 73, 2, 4),
('correo006', 5, 5, 29, 2, 1),
('correo006', 5, 5, 30, 3, 3),
('correo006', 5, 5, 31, 2, 2),
('correo006', 5, 5, 32, 2, 2),
('correo006', 5, 5, 33, 2, 2),
('correo006', 9, 10, 84, 2, 2),
('correo006', 9, 10, 85, 1, 1),
('correo006', 9, 10, 86, 1, 4),
('correo006', 9, 10, 87, 1, 4),
('correo006', 9, 10, 88, 2, 2),
('correo006', 11, 12, 104, 1, 3),
('correo006', 11, 12, 105, 1, 2),
('correo006', 11, 12, 106, 1, 1),
('correo006', 11, 12, 107, 3, 4),
('correo006', 11, 12, 108, 1, 4),
('correo006', 14, 14, 1, 1, 2),
('correo006', 14, 14, 2, 1, 3),
('correo006', 14, 14, 3, 1, 1),
('correo006', 14, 14, 4, 1, 1),
('correo006', 14, 14, 5, 1, 1),
('correo006', 14, 14, 6, 3, 3),
('correo006', 14, 14, 7, 4, 5),
('correo006', 14, 14, 8, 1, 4),
('correo006', 14, 14, 9, 3, 3),
('correo006', 14, 14, 10, 2, 2),
('correo006', 14, 14, 11, 1, 2),
('correo006', 14, 14, 12, 1, 3),
('correo006', 14, 14, 13, 1, 2),
('correo006', 17, 17, 19, 1, 3),
('correo006', 17, 17, 20, 1, 2),
('correo006', 17, 17, 21, 3, 3),
('correo006', 17, 17, 22, 1, 2),
('correo006', 17, 17, 23, 2, 4),
('correo007', 8, 8, 14, 4, 5),
('correo007', 8, 8, 15, 2, 2),
('correo007', 8, 8, 16, 4, 4),
('correo007', 8, 8, 17, 1, 2),
('correo007', 8, 8, 18, 2, 3),
('correo007', 9, 20, 89, 2, 2),
('correo007', 9, 20, 90, 1, 1),
('correo007', 9, 20, 91, 3, 4),
('correo007', 9, 20, 92, 1, 1),
('correo007', 9, 20, 93, 1, 4),
('correo007', 11, 21, 109, 4, 5),
('correo007', 11, 21, 110, 3, 4),
('correo007', 11, 21, 111, 3, 4),
('correo007', 11, 21, 112, 1, 5),
('correo007', 11, 21, 113, 3, 4),
('correo007', 14, 25, 129, 2, 2),
('correo007', 14, 25, 130, 1, 1),
('correo007', 14, 25, 131, 4, 4),
('correo007', 14, 25, 132, 2, 4),
('correo007', 14, 25, 133, 1, 4),
('correo008', 3, 3, 64, 2, 3),
('correo008', 3, 3, 65, 1, 2),
('correo008', 3, 3, 66, 3, 3),
('correo008', 3, 3, 67, 2, 2),
('correo008', 3, 3, 68, 3, 4),
('correo008', 9, 9, 79, 1, 2),
('correo008', 9, 9, 80, 1, 3),
('correo008', 9, 9, 81, 2, 3),
('correo008', 9, 9, 82, 3, 3),
('correo008', 9, 9, 83, 1, 2),
('correo008', 11, 22, 114, 2, 5),
('correo008', 11, 22, 115, 2, 4),
('correo008', 11, 22, 116, 3, 3),
('correo008', 11, 22, 117, 3, 4),
('correo008', 11, 22, 118, 1, 2),
('correo008', 14, 26, 134, 1, 1),
('correo008', 14, 26, 135, 1, 3),
('correo008', 14, 26, 136, 2, 4),
('correo008', 14, 26, 137, 1, 2),
('correo008', 14, 26, 138, 2, 4),
('correo008', 21, 3, 64, 1, 4),
('correo008', 21, 3, 65, 1, 3),
('correo008', 21, 3, 66, 1, 2),
('correo008', 21, 3, 67, 1, 4),
('correo008', 21, 3, 68, 2, 4),
('correo009', 9, 10, 84, 2, 3),
('correo009', 9, 10, 85, 1, 4),
('correo009', 9, 10, 86, 3, 4),
('correo009', 9, 10, 87, 3, 4),
('correo009', 9, 10, 88, 2, 2),
('correo010', 4, 3, 64, 2, 4),
('correo010', 4, 3, 65, 1, 3),
('correo010', 4, 3, 66, 2, 4),
('correo010', 4, 3, 67, 1, 4),
('correo010', 4, 3, 68, 1, 1),
('correo010', 9, 20, 89, 2, 3),
('correo010', 9, 20, 90, 3, 3),
('correo010', 9, 20, 91, 3, 4),
('correo010', 9, 20, 92, 1, 1),
('correo010', 9, 20, 93, 1, 2),
('correo010', 11, 11, 99, 2, 2),
('correo010', 11, 11, 100, 1, 1),
('correo010', 11, 11, 101, 1, 2),
('correo010', 11, 11, 102, 2, 2),
('correo010', 11, 11, 103, 1, 1),
('correo010', 18, 18, 24, 1, 3),
('correo010', 18, 18, 25, 2, 3),
('correo010', 18, 18, 26, 2, 2),
('correo010', 18, 18, 27, 3, 3),
('correo010', 18, 18, 28, 3, 3),
('correo011', 5, 5, 29, 2, 3),
('correo011', 5, 5, 30, 1, 1),
('correo011', 5, 5, 31, 1, 2),
('correo011', 5, 5, 32, 1, 1),
('correo011', 5, 5, 33, 1, 2),
('correo011', 9, 9, 79, 3, 3),
('correo011', 9, 9, 80, 3, 3),
('correo011', 9, 9, 81, 2, 4),
('correo011', 9, 9, 82, 1, 2),
('correo011', 9, 9, 83, 3, 3),
('correo011', 11, 12, 104, 3, 5),
('correo011', 11, 12, 105, 1, 4),
('correo011', 11, 12, 106, 1, 1),
('correo011', 11, 12, 107, 2, 2),
('correo011', 11, 12, 108, 1, 3),
('correo011', 14, 14, 1, 1, 2),
('correo011', 14, 14, 2, 1, 1),
('correo011', 14, 14, 3, 2, 5),
('correo011', 14, 14, 4, 2, 3),
('correo011', 14, 14, 5, 1, 2),
('correo011', 14, 14, 6, 4, 4),
('correo011', 14, 14, 7, 1, 3),
('correo011', 14, 14, 8, 1, 1),
('correo011', 14, 14, 9, 1, 2),
('correo011', 14, 14, 10, 2, 3),
('correo011', 14, 14, 11, 2, 2),
('correo011', 14, 14, 12, 1, 1),
('correo011', 14, 14, 13, 2, 2),
('correo011', 16, 16, 39, 1, 3),
('correo011', 16, 16, 40, 1, 3),
('correo011', 16, 16, 41, 2, 3),
('correo011', 16, 16, 42, 1, 1),
('correo011', 16, 16, 43, 3, 4),
('correo011', 17, 17, 19, 3, 3),
('correo011', 17, 17, 20, 1, 2),
('correo011', 17, 17, 21, 1, 4),
('correo011', 17, 17, 22, 2, 4),
('correo011', 17, 17, 23, 2, 4),
('correo012', 5, 5, 29, 2, 4),
('correo012', 5, 5, 30, 1, 2),
('correo012', 5, 5, 31, 3, 4),
('correo012', 5, 5, 32, 3, 4),
('correo012', 5, 5, 33, 2, 2),
('correo012', 14, 25, 129, 1, 1),
('correo012', 14, 25, 130, 3, 4),
('correo012', 14, 25, 131, 3, 5),
('correo012', 14, 25, 132, 1, 4),
('correo012', 14, 25, 133, 2, 2),
('correo013', 7, 7, 34, 2, 2),
('correo013', 7, 7, 35, 2, 3),
('correo013', 7, 7, 36, 2, 3),
('correo013', 7, 7, 37, 1, 2),
('correo013', 7, 7, 38, 2, 3),
('correo014', 4, 3, 64, 2, 2),
('correo014', 4, 3, 65, 2, 3),
('correo014', 4, 3, 66, 2, 3),
('correo014', 4, 3, 67, 2, 3),
('correo014', 4, 3, 68, 3, 4),
('correo014', 5, 5, 29, 2, 3),
('correo014', 5, 5, 30, 2, 4),
('correo014', 5, 5, 31, 3, 4),
('correo014', 5, 5, 32, 1, 4),
('correo014', 5, 5, 33, 2, 2),
('correo014', 8, 8, 14, 3, 3),
('correo014', 8, 8, 15, 3, 5),
('correo014', 8, 8, 16, 2, 2),
('correo014', 8, 8, 17, 2, 3),
('correo014', 8, 8, 18, 1, 4),
('correo014', 9, 10, 84, 3, 3),
('correo014', 9, 10, 85, 1, 2),
('correo014', 9, 10, 86, 1, 2),
('correo014', 9, 10, 87, 1, 1),
('correo014', 9, 10, 88, 1, 1),
('correo014', 11, 21, 109, 2, 3),
('correo014', 11, 21, 110, 1, 4),
('correo014', 11, 21, 111, 1, 4),
('correo014', 11, 21, 112, 1, 2),
('correo014', 11, 21, 113, 1, 2),
('correo014', 14, 26, 134, 1, 5),
('correo014', 14, 26, 135, 3, 3),
('correo014', 14, 26, 136, 1, 4),
('correo014', 14, 26, 137, 2, 4),
('correo014', 14, 26, 138, 4, 4),
('correo014', 16, 16, 39, 1, 1),
('correo014', 16, 16, 40, 2, 3),
('correo014', 16, 16, 41, 1, 2),
('correo014', 16, 16, 42, 1, 2),
('correo014', 16, 16, 43, 2, 2),
('correo014', 17, 17, 19, 1, 4),
('correo014', 17, 17, 20, 1, 2),
('correo014', 17, 17, 21, 3, 4),
('correo014', 17, 17, 22, 1, 3),
('correo014', 17, 17, 23, 2, 3),
('correo015', 9, 20, 89, 2, 3),
('correo015', 9, 20, 90, 1, 2),
('correo015', 9, 20, 91, 2, 3),
('correo015', 9, 20, 92, 1, 1),
('correo015', 9, 20, 93, 2, 4),
('correo015', 11, 22, 114, 1, 3),
('correo015', 11, 22, 115, 3, 4),
('correo015', 11, 22, 116, 2, 2),
('correo015', 11, 22, 117, 2, 4),
('correo015', 11, 22, 118, 3, 3),
('correo015', 14, 14, 1, 2, 3),
('correo015', 14, 14, 2, 2, 4),
('correo015', 14, 14, 3, 1, 2),
('correo015', 14, 14, 4, 1, 1),
('correo015', 14, 14, 5, 4, 4),
('correo015', 14, 14, 6, 4, 5),
('correo015', 14, 14, 7, 2, 2),
('correo015', 14, 14, 8, 1, 4),
('correo015', 14, 14, 9, 3, 3),
('correo015', 14, 14, 10, 1, 2),
('correo015', 14, 14, 11, 1, 1),
('correo015', 14, 14, 12, 2, 2),
('correo015', 14, 14, 13, 3, 5),
('correo015', 15, 15, 49, 1, 2),
('correo015', 15, 15, 50, 2, 4),
('correo015', 15, 15, 51, 3, 4),
('correo015', 15, 15, 52, 1, 3),
('correo015', 15, 15, 53, 3, 4),
('correo016', 6, 6, 44, 2, 3),
('correo016', 6, 6, 45, 1, 3),
('correo016', 6, 6, 46, 1, 2),
('correo016', 6, 6, 47, 3, 3),
('correo016', 6, 6, 48, 1, 3),
('correo017', 9, 9, 79, 1, 3),
('correo017', 9, 9, 80, 3, 4),
('correo017', 9, 9, 81, 1, 3),
('correo017', 9, 9, 82, 3, 4),
('correo017', 9, 9, 83, 1, 1),
('correo018', 3, 2, 59, 1, 3),
('correo018', 3, 2, 60, 1, 3),
('correo018', 3, 2, 61, 3, 3),
('correo018', 3, 2, 62, 1, 2),
('correo018', 3, 2, 63, 3, 3),
('correo018', 9, 10, 84, 1, 4),
('correo018', 9, 10, 85, 2, 3),
('correo018', 9, 10, 86, 2, 2),
('correo018', 9, 10, 87, 3, 3),
('correo018', 9, 10, 88, 1, 1),
('correo018', 18, 18, 24, 3, 4),
('correo018', 18, 18, 25, 1, 3),
('correo018', 18, 18, 26, 1, 2),
('correo018', 18, 18, 27, 1, 3),
('correo018', 18, 18, 28, 1, 2),
('correo018', 21, 2, 59, 1, 4),
('correo018', 21, 2, 60, 3, 3),
('correo018', 21, 2, 61, 1, 1),
('correo018', 21, 2, 62, 2, 3),
('correo018', 21, 2, 63, 1, 1),
('correo019', 9, 20, 89, 2, 2),
('correo019', 9, 20, 90, 3, 3),
('correo019', 9, 20, 91, 1, 3),
('correo019', 9, 20, 92, 1, 1),
('correo019', 9, 20, 93, 1, 4),
('correo020', 9, 9, 79, 3, 4),
('correo020', 9, 9, 80, 2, 3),
('correo020', 9, 9, 81, 1, 3),
('correo020', 9, 9, 82, 1, 2),
('correo020', 9, 9, 83, 1, 4),
('correo020', 11, 11, 99, 1, 2),
('correo020', 11, 11, 100, 4, 4),
('correo020', 11, 11, 101, 3, 4),
('correo020', 11, 11, 102, 1, 4),
('correo020', 11, 11, 103, 1, 5),
('correo020', 14, 25, 129, 1, 4),
('correo020', 14, 25, 130, 2, 3),
('correo020', 14, 25, 131, 2, 3),
('correo020', 14, 25, 132, 2, 2),
('correo020', 14, 25, 133, 1, 3),
('correo021', 1, 3, 64, 3, 3),
('correo021', 1, 3, 65, 1, 3),
('correo021', 1, 3, 66, 2, 2),
('correo021', 1, 3, 67, 2, 3),
('correo021', 1, 3, 68, 1, 3),
('correo021', 15, 15, 49, 2, 2),
('correo021', 15, 15, 50, 1, 1),
('correo021', 15, 15, 51, 3, 3),
('correo021', 15, 15, 52, 3, 3),
('correo021', 15, 15, 53, 2, 2),
('correo022', 5, 5, 29, 1, 3),
('correo022', 5, 5, 30, 1, 1),
('correo022', 5, 5, 31, 1, 1),
('correo022', 5, 5, 32, 1, 3),
('correo022', 5, 5, 33, 1, 2),
('correo022', 8, 8, 14, 2, 2),
('correo022', 8, 8, 15, 1, 1),
('correo022', 8, 8, 16, 1, 2),
('correo022', 8, 8, 17, 2, 5),
('correo022', 8, 8, 18, 2, 3),
('correo022', 14, 26, 134, 4, 5),
('correo022', 14, 26, 135, 3, 3),
('correo022', 14, 26, 136, 3, 3),
('correo022', 14, 26, 137, 2, 5),
('correo022', 14, 26, 138, 3, 4),
('correo023', 8, 8, 14, 3, 3),
('correo023', 8, 8, 15, 1, 2),
('correo023', 8, 8, 16, 1, 1),
('correo023', 8, 8, 17, 1, 1),
('correo023', 8, 8, 18, 4, 5),
('correo023', 9, 10, 84, 2, 2),
('correo023', 9, 10, 85, 1, 1),
('correo023', 9, 10, 86, 2, 2),
('correo023', 9, 10, 87, 2, 2),
('correo023', 9, 10, 88, 3, 4),
('correo023', 11, 12, 104, 3, 3),
('correo023', 11, 12, 105, 2, 3),
('correo023', 11, 12, 106, 2, 4),
('correo023', 11, 12, 107, 2, 5),
('correo023', 11, 12, 108, 2, 3),
('correo024', 2, 3, 64, 3, 3),
('correo024', 2, 3, 65, 2, 2),
('correo024', 2, 3, 66, 1, 1),
('correo024', 2, 3, 67, 1, 2),
('correo024', 2, 3, 68, 2, 3),
('correo024', 9, 20, 89, 2, 2),
('correo024', 9, 20, 90, 1, 1),
('correo024', 9, 20, 91, 1, 1),
('correo024', 9, 20, 92, 1, 1),
('correo024', 9, 20, 93, 1, 4),
('correo024', 14, 14, 1, 2, 2),
('correo024', 14, 14, 2, 1, 5),
('correo024', 14, 14, 3, 4, 5),
('correo024', 14, 14, 4, 2, 2),
('correo024', 14, 14, 5, 1, 3),
('correo024', 14, 14, 6, 1, 1),
('correo024', 14, 14, 7, 2, 2),
('correo024', 14, 14, 8, 1, 2),
('correo024', 14, 14, 9, 1, 1),
('correo024', 14, 14, 10, 2, 4),
('correo024', 14, 14, 11, 4, 4),
('correo024', 14, 14, 12, 1, 1),
('correo024', 14, 14, 13, 2, 4),
('correo024', 18, 18, 24, 2, 2),
('correo024', 18, 18, 25, 1, 4),
('correo024', 18, 18, 26, 1, 3),
('correo024', 18, 18, 27, 3, 4),
('correo024', 18, 18, 28, 2, 3),
('correo025', 1, 1, 54, 1, 2),
('correo025', 1, 1, 55, 1, 2),
('correo025', 1, 1, 56, 1, 3),
('correo025', 1, 1, 57, 1, 1),
('correo025', 1, 1, 58, 2, 3),
('correo025', 7, 7, 34, 2, 4),
('correo025', 7, 7, 35, 2, 4),
('correo025', 7, 7, 36, 2, 2),
('correo025', 7, 7, 37, 2, 2),
('correo025', 7, 7, 38, 1, 1),
('correo025', 15, 15, 49, 2, 3),
('correo025', 15, 15, 50, 1, 2),
('correo025', 15, 15, 51, 1, 3),
('correo025', 15, 15, 52, 1, 4),
('correo025', 15, 15, 53, 1, 2),
('correo026', 3, 3, 64, 3, 3),
('correo026', 3, 3, 65, 1, 1),
('correo026', 3, 3, 66, 1, 2),
('correo026', 3, 3, 67, 3, 3),
('correo026', 3, 3, 68, 1, 1),
('correo026', 4, 2, 59, 2, 2),
('correo026', 4, 2, 60, 2, 2),
('correo026', 4, 2, 61, 1, 1),
('correo026', 4, 2, 62, 1, 4),
('correo026', 4, 2, 63, 1, 3),
('correo026', 8, 23, 119, 2, 4),
('correo026', 8, 23, 120, 2, 3),
('correo026', 8, 23, 121, 1, 1),
('correo026', 8, 23, 122, 1, 1),
('correo026', 8, 23, 123, 1, 5),
('correo026', 9, 9, 79, 3, 3),
('correo026', 9, 9, 80, 1, 2),
('correo026', 9, 9, 81, 2, 2),
('correo026', 9, 9, 82, 1, 1),
('correo026', 9, 9, 83, 1, 1),
('correo026', 21, 3, 64, 2, 2),
('correo026', 21, 3, 65, 2, 4),
('correo026', 21, 3, 66, 1, 3),
('correo026', 21, 3, 67, 1, 2),
('correo026', 21, 3, 68, 1, 2),
('correo027', 5, 5, 29, 1, 3),
('correo027', 5, 5, 30, 2, 2),
('correo027', 5, 5, 31, 1, 3),
('correo027', 5, 5, 32, 3, 3),
('correo027', 5, 5, 33, 2, 2),
('correo027', 9, 10, 84, 3, 3),
('correo027', 9, 10, 85, 2, 3),
('correo027', 9, 10, 86, 2, 2),
('correo027', 9, 10, 87, 3, 4),
('correo027', 9, 10, 88, 2, 2),
('correo027', 11, 21, 109, 3, 3),
('correo027', 11, 21, 110, 2, 4),
('correo027', 11, 21, 111, 1, 4),
('correo027', 11, 21, 112, 2, 4),
('correo027', 11, 21, 113, 3, 3),
('correo027', 14, 25, 129, 3, 3),
('correo027', 14, 25, 130, 1, 2),
('correo027', 14, 25, 131, 2, 4),
('correo027', 14, 25, 132, 1, 2),
('correo027', 14, 25, 133, 1, 5),
('correo027', 16, 16, 39, 2, 2),
('correo027', 16, 16, 40, 2, 4),
('correo027', 16, 16, 41, 1, 1),
('correo027', 16, 16, 42, 2, 2),
('correo027', 16, 16, 43, 1, 4),
('correo027', 17, 17, 19, 1, 2),
('correo027', 17, 17, 20, 1, 2),
('correo027', 17, 17, 21, 1, 2),
('correo027', 17, 17, 22, 2, 2),
('correo027', 17, 17, 23, 1, 2),
('correo028', 4, 1, 54, 1, 4),
('correo028', 4, 1, 55, 2, 3),
('correo028', 4, 1, 56, 2, 2),
('correo028', 4, 1, 57, 3, 3),
('correo028', 4, 1, 58, 2, 3),
('correo028', 9, 20, 89, 2, 3),
('correo028', 9, 20, 90, 3, 4),
('correo028', 9, 20, 91, 2, 4),
('correo028', 9, 20, 92, 1, 2),
('correo028', 9, 20, 93, 1, 1),
('correo028', 11, 22, 114, 1, 3),
('correo028', 11, 22, 115, 2, 3),
('correo028', 11, 22, 116, 1, 1),
('correo028', 11, 22, 117, 2, 3),
('correo028', 11, 22, 118, 4, 4),
('correo029', 5, 5, 29, 1, 3),
('correo029', 5, 5, 30, 2, 3),
('correo029', 5, 5, 31, 1, 4),
('correo029', 5, 5, 32, 1, 3),
('correo029', 5, 5, 33, 1, 2),
('correo029', 8, 23, 119, 1, 3),
('correo029', 8, 23, 120, 1, 2),
('correo029', 8, 23, 121, 3, 4),
('correo029', 8, 23, 122, 1, 2),
('correo029', 8, 23, 123, 2, 2),
('correo029', 9, 9, 79, 1, 4),
('correo029', 9, 9, 80, 3, 4),
('correo029', 9, 9, 81, 2, 2),
('correo029', 9, 9, 82, 2, 3),
('correo029', 9, 9, 83, 2, 3),
('correo029', 11, 11, 99, 3, 4),
('correo029', 11, 11, 100, 2, 3),
('correo029', 11, 11, 101, 1, 2),
('correo029', 11, 11, 102, 3, 3),
('correo029', 11, 11, 103, 1, 3),
('correo029', 14, 26, 134, 1, 2),
('correo029', 14, 26, 135, 1, 4),
('correo029', 14, 26, 136, 2, 3),
('correo029', 14, 26, 137, 1, 2),
('correo029', 14, 26, 138, 1, 2),
('correo029', 17, 17, 19, 1, 2),
('correo029', 17, 17, 20, 2, 4),
('correo029', 17, 17, 21, 1, 1),
('correo029', 17, 17, 22, 1, 2),
('correo029', 17, 17, 23, 2, 3),
('correo030', 2, 2, 59, 1, 4),
('correo030', 2, 2, 60, 3, 4),
('correo030', 2, 2, 61, 1, 1),
('correo030', 2, 2, 62, 2, 3),
('correo030', 2, 2, 63, 2, 4),
('correo030', 9, 10, 84, 2, 3),
('correo030', 9, 10, 85, 1, 3),
('correo030', 9, 10, 86, 1, 1),
('correo030', 9, 10, 87, 2, 3),
('correo030', 9, 10, 88, 1, 1),
('correo030', 17, 17, 19, 3, 3),
('correo030', 17, 17, 20, 1, 1),
('correo030', 17, 17, 21, 3, 4),
('correo030', 17, 17, 22, 3, 3),
('correo030', 17, 17, 23, 1, 1),
('correo031', 8, 8, 14, 3, 3),
('correo031', 8, 8, 15, 1, 2),
('correo031', 8, 8, 16, 1, 1),
('correo031', 8, 8, 17, 1, 3),
('correo031', 8, 8, 18, 2, 3),
('correo031', 10, 9, 79, 2, 2),
('correo031', 10, 9, 80, 3, 4),
('correo031', 10, 9, 81, 2, 4),
('correo031', 10, 9, 82, 3, 3),
('correo031', 10, 9, 83, 1, 3),
('correo031', 14, 14, 1, 2, 3),
('correo031', 14, 14, 2, 1, 3),
('correo031', 14, 14, 3, 1, 2),
('correo031', 14, 14, 4, 1, 1),
('correo031', 14, 14, 5, 1, 1),
('correo031', 14, 14, 6, 4, 5),
('correo031', 14, 14, 7, 2, 4),
('correo031', 14, 14, 8, 3, 4),
('correo031', 14, 14, 9, 3, 5),
('correo031', 14, 14, 10, 3, 4),
('correo031', 14, 14, 11, 3, 4),
('correo031', 14, 14, 12, 2, 4),
('correo031', 14, 14, 13, 1, 1),
('correo032', 6, 6, 44, 2, 3),
('correo032', 6, 6, 45, 1, 2),
('correo032', 6, 6, 46, 3, 3),
('correo032', 6, 6, 47, 2, 2),
('correo032', 6, 6, 48, 3, 3),
('correo032', 15, 15, 49, 2, 3),
('correo032', 15, 15, 50, 2, 4),
('correo032', 15, 15, 51, 1, 2),
('correo032', 15, 15, 52, 2, 3),
('correo032', 15, 15, 53, 2, 2),
('correo033', 3, 1, 54, 1, 1),
('correo033', 3, 1, 55, 2, 2),
('correo033', 3, 1, 56, 2, 4),
('correo033', 3, 1, 57, 1, 4),
('correo033', 3, 1, 58, 1, 2),
('correo033', 4, 2, 59, 2, 2),
('correo033', 4, 2, 60, 1, 3),
('correo033', 4, 2, 61, 1, 3),
('correo033', 4, 2, 62, 1, 2),
('correo033', 4, 2, 63, 1, 2),
('correo033', 10, 10, 84, 1, 4),
('correo033', 10, 10, 85, 1, 1),
('correo033', 10, 10, 86, 1, 2),
('correo033', 10, 10, 87, 2, 4),
('correo033', 10, 10, 88, 2, 3),
('correo033', 11, 12, 104, 1, 2),
('correo033', 11, 12, 105, 2, 2),
('correo033', 11, 12, 106, 3, 3),
('correo033', 11, 12, 107, 2, 3),
('correo033', 11, 12, 108, 2, 4),
('correo033', 14, 25, 129, 4, 4),
('correo033', 14, 25, 130, 1, 2),
('correo033', 14, 25, 131, 1, 5),
('correo033', 14, 25, 132, 1, 3),
('correo033', 14, 25, 133, 2, 5),
('correo033', 16, 16, 39, 1, 1),
('correo033', 16, 16, 40, 3, 3),
('correo033', 16, 16, 41, 1, 2),
('correo033', 16, 16, 42, 2, 2),
('correo033', 16, 16, 43, 2, 3),
('correo033', 18, 18, 24, 3, 3),
('correo033', 18, 18, 25, 1, 3),
('correo033', 18, 18, 26, 3, 4),
('correo033', 18, 18, 27, 1, 1),
('correo033', 18, 18, 28, 1, 4),
('correo033', 21, 1, 54, 2, 3),
('correo033', 21, 1, 55, 1, 3),
('correo033', 21, 1, 56, 1, 2),
('correo033', 21, 1, 57, 2, 4),
('correo033', 21, 1, 58, 1, 1),
('correo034', 8, 8, 14, 2, 2),
('correo034', 8, 8, 15, 1, 1),
('correo034', 8, 8, 16, 3, 3),
('correo034', 8, 8, 17, 3, 4),
('correo034', 8, 8, 18, 2, 2),
('correo035', 10, 20, 89, 2, 3),
('correo035', 10, 20, 90, 1, 1),
('correo035', 10, 20, 91, 1, 4),
('correo035', 10, 20, 92, 2, 2),
('correo035', 10, 20, 93, 2, 2),
('correo035', 14, 26, 134, 2, 2),
('correo035', 14, 26, 135, 1, 1),
('correo035', 14, 26, 136, 3, 3),
('correo035', 14, 26, 137, 2, 4),
('correo035', 14, 26, 138, 2, 2),
('correo037', 3, 4, 69, 1, 3),
('correo037', 3, 4, 70, 1, 1),
('correo037', 3, 4, 71, 2, 2),
('correo037', 3, 4, 72, 1, 1),
('correo037', 3, 4, 73, 1, 1),
('correo037', 10, 9, 79, 1, 4),
('correo037', 10, 9, 80, 2, 2),
('correo037', 10, 9, 81, 3, 3),
('correo037', 10, 9, 82, 1, 3),
('correo037', 10, 9, 83, 1, 1),
('correo037', 21, 4, 69, 1, 2),
('correo037', 21, 4, 70, 1, 2),
('correo037', 21, 4, 71, 1, 2),
('correo037', 21, 4, 72, 1, 1),
('correo037', 21, 4, 73, 2, 2),
('correo038', 14, 14, 1, 1, 5),
('correo038', 14, 14, 2, 1, 3),
('correo038', 14, 14, 3, 1, 4),
('correo038', 14, 14, 4, 2, 4),
('correo038', 14, 14, 5, 2, 4),
('correo038', 14, 14, 6, 1, 2),
('correo038', 14, 14, 7, 2, 5),
('correo038', 14, 14, 8, 1, 2),
('correo038', 14, 14, 9, 3, 3),
('correo038', 14, 14, 10, 1, 2),
('correo038', 14, 14, 11, 4, 4),
('correo038', 14, 14, 12, 1, 1),
('correo038', 14, 14, 13, 1, 1),
('correo039', 1, 2, 59, 3, 3),
('correo039', 1, 2, 60, 1, 2),
('correo039', 1, 2, 61, 1, 1),
('correo039', 1, 2, 62, 1, 1),
('correo039', 1, 2, 63, 1, 3),
('correo040', 7, 7, 34, 3, 4),
('correo040', 7, 7, 35, 2, 3),
('correo040', 7, 7, 36, 1, 1),
('correo040', 7, 7, 37, 2, 2),
('correo040', 7, 7, 38, 1, 3),
('correo040', 15, 15, 49, 1, 3),
('correo040', 15, 15, 50, 2, 2),
('correo040', 15, 15, 51, 1, 4),
('correo040', 15, 15, 52, 1, 2),
('correo040', 15, 15, 53, 1, 1),
('correo041', 10, 10, 84, 1, 1),
('correo041', 10, 10, 85, 1, 3),
('correo041', 10, 10, 86, 1, 3),
('correo041', 10, 10, 87, 2, 2),
('correo041', 10, 10, 88, 2, 3),
('correo041', 11, 21, 109, 3, 3),
('correo041', 11, 21, 110, 4, 4),
('correo041', 11, 21, 111, 1, 1),
('correo041', 11, 21, 112, 2, 3),
('correo041', 11, 21, 113, 4, 4),
('correo042', 10, 20, 89, 1, 3),
('correo042', 10, 20, 90, 2, 2),
('correo042', 10, 20, 91, 1, 2),
('correo042', 10, 20, 92, 1, 2),
('correo042', 10, 20, 93, 3, 3),
('correo042', 14, 25, 129, 1, 3),
('correo042', 14, 25, 130, 2, 4),
('correo042', 14, 25, 131, 2, 5),
('correo042', 14, 25, 132, 1, 3),
('correo042', 14, 25, 133, 1, 3),
('correo043', 1, 3, 64, 1, 1),
('correo043', 1, 3, 65, 2, 4),
('correo043', 1, 3, 66, 1, 3),
('correo043', 1, 3, 67, 2, 3),
('correo043', 1, 3, 68, 2, 3),
('correo043', 7, 7, 34, 1, 1),
('correo043', 7, 7, 35, 3, 3),
('correo043', 7, 7, 36, 2, 2),
('correo043', 7, 7, 37, 1, 3),
('correo043', 7, 7, 38, 2, 2),
('correo044', 7, 7, 34, 1, 3),
('correo044', 7, 7, 35, 1, 4),
('correo044', 7, 7, 36, 2, 2),
('correo044', 7, 7, 37, 1, 4),
('correo044', 7, 7, 38, 2, 4),
('correo044', 15, 15, 49, 1, 1),
('correo044', 15, 15, 50, 1, 2),
('correo044', 15, 15, 51, 1, 2),
('correo044', 15, 15, 52, 1, 2),
('correo044', 15, 15, 53, 2, 2),
('correo045', 4, 4, 69, 3, 3),
('correo045', 4, 4, 70, 3, 3),
('correo045', 4, 4, 71, 3, 3),
('correo045', 4, 4, 72, 2, 2),
('correo045', 4, 4, 73, 1, 1),
('correo045', 5, 5, 29, 1, 1),
('correo045', 5, 5, 30, 1, 2),
('correo045', 5, 5, 31, 3, 3),
('correo045', 5, 5, 32, 2, 4),
('correo045', 5, 5, 33, 1, 4),
('correo045', 8, 23, 119, 2, 5),
('correo045', 8, 23, 120, 1, 1),
('correo045', 8, 23, 121, 1, 1),
('correo045', 8, 23, 122, 1, 1),
('correo045', 8, 23, 123, 4, 5),
('correo045', 10, 9, 79, 1, 1),
('correo045', 10, 9, 80, 2, 3),
('correo045', 10, 9, 81, 3, 4),
('correo045', 10, 9, 82, 3, 4),
('correo045', 10, 9, 83, 1, 3),
('correo045', 11, 22, 114, 1, 2),
('correo045', 11, 22, 115, 3, 3),
('correo045', 11, 22, 116, 1, 4),
('correo045', 11, 22, 117, 2, 3),
('correo045', 11, 22, 118, 1, 2),
('correo045', 14, 26, 134, 1, 5),
('correo045', 14, 26, 135, 1, 2),
('correo045', 14, 26, 136, 2, 3),
('correo045', 14, 26, 137, 1, 2),
('correo045', 14, 26, 138, 1, 3),
('correo045', 18, 18, 24, 3, 4),
('correo045', 18, 18, 25, 2, 4),
('correo045', 18, 18, 26, 1, 3),
('correo045', 18, 18, 27, 3, 4),
('correo045', 18, 18, 28, 1, 2),
('correo046', 2, 1, 54, 1, 4),
('correo046', 2, 1, 55, 2, 2),
('correo046', 2, 1, 56, 1, 2),
('correo046', 2, 1, 57, 1, 1),
('correo046', 2, 1, 58, 1, 2),
('correo046', 8, 23, 119, 2, 2),
('correo046', 8, 23, 120, 1, 4),
('correo046', 8, 23, 121, 1, 5),
('correo046', 8, 23, 122, 1, 3),
('correo046', 8, 23, 123, 1, 2),
('correo046', 10, 10, 84, 3, 3),
('correo046', 10, 10, 85, 1, 2),
('correo046', 10, 10, 86, 2, 2),
('correo046', 10, 10, 87, 2, 3),
('correo046', 10, 10, 88, 1, 2),
('correo046', 18, 18, 24, 1, 2),
('correo046', 18, 18, 25, 2, 2),
('correo046', 18, 18, 26, 1, 2),
('correo046', 18, 18, 27, 2, 2),
('correo046', 18, 18, 28, 2, 2),
('correo047', 3, 1, 54, 2, 4),
('correo047', 3, 1, 55, 2, 3),
('correo047', 3, 1, 56, 1, 1),
('correo047', 3, 1, 57, 2, 3),
('correo047', 3, 1, 58, 2, 3),
('correo047', 10, 20, 89, 2, 3),
('correo047', 10, 20, 90, 1, 4),
('correo047', 10, 20, 91, 2, 4),
('correo047', 10, 20, 92, 2, 2),
('correo047', 10, 20, 93, 2, 3),
('correo047', 11, 11, 99, 1, 2),
('correo047', 11, 11, 100, 2, 2),
('correo047', 11, 11, 101, 1, 1),
('correo047', 11, 11, 102, 1, 1),
('correo047', 11, 11, 103, 1, 2),
('correo047', 21, 1, 54, 1, 4),
('correo047', 21, 1, 55, 3, 3),
('correo047', 21, 1, 56, 1, 2),
('correo047', 21, 1, 57, 1, 2),
('correo047', 21, 1, 58, 1, 3),
('correo048', 6, 6, 44, 1, 1),
('correo048', 6, 6, 45, 2, 3),
('correo048', 6, 6, 46, 1, 1),
('correo048', 6, 6, 47, 2, 4),
('correo048', 6, 6, 48, 2, 2),
('correo048', 8, 23, 119, 4, 4),
('correo048', 8, 23, 120, 1, 1),
('correo048', 8, 23, 121, 3, 3),
('correo048', 8, 23, 122, 1, 2),
('correo048', 8, 23, 123, 1, 2),
('correo048', 10, 9, 79, 1, 3),
('correo048', 10, 9, 80, 2, 2),
('correo048', 10, 9, 81, 1, 3),
('correo048', 10, 9, 82, 2, 2),
('correo048', 10, 9, 83, 1, 3),
('correo048', 11, 12, 104, 2, 4),
('correo048', 11, 12, 105, 1, 1),
('correo048', 11, 12, 106, 3, 3),
('correo048', 11, 12, 107, 3, 3),
('correo048', 11, 12, 108, 2, 3),
('correo048', 14, 14, 1, 1, 2),
('correo048', 14, 14, 2, 4, 4),
('correo048', 14, 14, 3, 1, 3),
('correo048', 14, 14, 4, 2, 2),
('correo048', 14, 14, 5, 1, 5),
('correo048', 14, 14, 6, 1, 1),
('correo048', 14, 14, 7, 3, 4),
('correo048', 14, 14, 8, 1, 1),
('correo048', 14, 14, 9, 1, 4),
('correo048', 14, 14, 10, 1, 4),
('correo048', 14, 14, 11, 1, 1),
('correo048', 14, 14, 12, 1, 1),
('correo048', 14, 14, 13, 1, 2),
('correo049', 2, 4, 69, 2, 3),
('correo049', 2, 4, 70, 1, 3),
('correo049', 2, 4, 71, 1, 1),
('correo049', 2, 4, 72, 1, 1),
('correo049', 2, 4, 73, 2, 2),
('correo049', 3, 2, 59, 1, 4),
('correo049', 3, 2, 60, 2, 3),
('correo049', 3, 2, 61, 1, 2),
('correo049', 3, 2, 62, 1, 1),
('correo049', 3, 2, 63, 1, 2),
('correo049', 10, 10, 84, 3, 3),
('correo049', 10, 10, 85, 1, 1),
('correo049', 10, 10, 86, 1, 3),
('correo049', 10, 10, 87, 1, 3),
('correo049', 10, 10, 88, 1, 2),
('correo049', 14, 25, 129, 1, 1),
('correo049', 14, 25, 130, 1, 2),
('correo049', 14, 25, 131, 3, 4),
('correo049', 14, 25, 132, 1, 3),
('correo049', 14, 25, 133, 1, 2),
('correo049', 21, 2, 59, 1, 1),
('correo049', 21, 2, 60, 1, 1),
('correo049', 21, 2, 61, 1, 3),
('correo049', 21, 2, 62, 1, 3),
('correo049', 21, 2, 63, 1, 1),
('correo050', 2, 3, 64, 1, 1),
('correo050', 2, 3, 65, 1, 1),
('correo050', 2, 3, 66, 3, 3),
('correo050', 2, 3, 67, 2, 2),
('correo050', 2, 3, 68, 3, 4),
('correo050', 8, 23, 119, 2, 5),
('correo050', 8, 23, 120, 3, 3),
('correo050', 8, 23, 121, 4, 5),
('correo050', 8, 23, 122, 3, 3),
('correo050', 8, 23, 123, 1, 2),
('correo050', 10, 20, 89, 2, 2),
('correo050', 10, 20, 90, 1, 3),
('correo050', 10, 20, 91, 1, 3),
('correo050', 10, 20, 92, 1, 2),
('correo050', 10, 20, 93, 2, 2),
('correo051', 1, 4, 69, 2, 4),
('correo051', 1, 4, 70, 1, 3),
('correo051', 1, 4, 71, 2, 2),
('correo051', 1, 4, 72, 3, 4),
('correo051', 1, 4, 73, 1, 2),
('correo051', 3, 3, 64, 1, 2),
('correo051', 3, 3, 65, 3, 3),
('correo051', 3, 3, 66, 1, 1),
('correo051', 3, 3, 67, 3, 3),
('correo051', 3, 3, 68, 2, 3),
('correo051', 8, 8, 14, 2, 3),
('correo051', 8, 8, 15, 3, 3),
('correo051', 8, 8, 16, 1, 2),
('correo051', 8, 8, 17, 3, 4),
('correo051', 8, 8, 18, 2, 3),
('correo051', 11, 21, 109, 2, 5),
('correo051', 11, 21, 110, 3, 5),
('correo051', 11, 21, 111, 1, 2),
('correo051', 11, 21, 112, 1, 4),
('correo051', 11, 21, 113, 2, 2),
('correo051', 14, 26, 134, 1, 3),
('correo051', 14, 26, 135, 1, 1),
('correo051', 14, 26, 136, 4, 5),
('correo051', 14, 26, 137, 3, 4),
('correo051', 14, 26, 138, 2, 4),
('correo051', 18, 18, 24, 1, 4),
('correo051', 18, 18, 25, 1, 4),
('correo051', 18, 18, 26, 1, 3),
('correo051', 18, 18, 27, 1, 3),
('correo051', 18, 18, 28, 1, 3),
('correo051', 21, 3, 64, 2, 4),
('correo051', 21, 3, 65, 2, 2),
('correo051', 21, 3, 66, 1, 1),
('correo051', 21, 3, 67, 3, 4),
('correo051', 21, 3, 68, 1, 2),
('correo053', 4, 1, 54, 1, 1),
('correo053', 4, 1, 55, 1, 2),
('correo053', 4, 1, 56, 3, 3),
('correo053', 4, 1, 57, 3, 3),
('correo053', 4, 1, 58, 1, 1),
('correo053', 6, 6, 44, 3, 3),
('correo053', 6, 6, 45, 1, 2),
('correo053', 6, 6, 46, 1, 2),
('correo053', 6, 6, 47, 1, 1),
('correo053', 6, 6, 48, 2, 2),
('correo053', 10, 9, 79, 2, 2),
('correo053', 10, 9, 80, 2, 3),
('correo053', 10, 9, 81, 3, 4),
('correo053', 10, 9, 82, 3, 3),
('correo053', 10, 9, 83, 1, 1),
('correo053', 12, 11, 99, 3, 3),
('correo053', 12, 11, 100, 2, 3),
('correo053', 12, 11, 101, 1, 1),
('correo053', 12, 11, 102, 1, 1),
('correo053', 12, 11, 103, 1, 2),
('correo053', 15, 15, 49, 2, 2),
('correo053', 15, 15, 50, 2, 4),
('correo053', 15, 15, 51, 2, 3),
('correo053', 15, 15, 52, 1, 4),
('correo053', 15, 15, 53, 3, 3),
('correo054', 2, 1, 54, 1, 4),
('correo054', 2, 1, 55, 2, 2),
('correo054', 2, 1, 56, 1, 3),
('correo054', 2, 1, 57, 3, 3),
('correo054', 2, 1, 58, 1, 2),
('correo054', 8, 8, 14, 2, 4),
('correo054', 8, 8, 15, 1, 1),
('correo054', 8, 8, 16, 3, 4),
('correo054', 8, 8, 17, 4, 4),
('correo054', 8, 8, 18, 1, 4),
('correo054', 10, 10, 84, 3, 4),
('correo054', 10, 10, 85, 3, 3),
('correo054', 10, 10, 86, 1, 3),
('correo054', 10, 10, 87, 2, 4),
('correo054', 10, 10, 88, 1, 2),
('correo054', 14, 14, 1, 3, 4),
('correo054', 14, 14, 2, 1, 3),
('correo054', 14, 14, 3, 1, 2),
('correo054', 14, 14, 4, 1, 2),
('correo054', 14, 14, 5, 1, 1),
('correo054', 14, 14, 6, 1, 2),
('correo054', 14, 14, 7, 2, 2),
('correo054', 14, 14, 8, 2, 2),
('correo054', 14, 14, 9, 2, 4),
('correo054', 14, 14, 10, 2, 2),
('correo054', 14, 14, 11, 1, 3),
('correo054', 14, 14, 12, 1, 1),
('correo054', 14, 14, 13, 4, 5),
('correo055', 7, 7, 34, 1, 1),
('correo055', 7, 7, 35, 3, 3),
('correo055', 7, 7, 36, 3, 4),
('correo055', 7, 7, 37, 1, 2),
('correo055', 7, 7, 38, 2, 2),
('correo055', 15, 15, 49, 1, 2),
('correo055', 15, 15, 50, 1, 4),
('correo055', 15, 15, 51, 3, 3),
('correo055', 15, 15, 52, 2, 4),
('correo055', 15, 15, 53, 2, 3),
('correo056', 1, 1, 54, 3, 4),
('correo056', 1, 1, 55, 1, 2),
('correo056', 1, 1, 56, 2, 3),
('correo056', 1, 1, 57, 1, 4),
('correo056', 1, 1, 58, 3, 3),
('correo056', 7, 7, 34, 3, 4),
('correo056', 7, 7, 35, 1, 2),
('correo056', 7, 7, 36, 1, 1),
('correo056', 7, 7, 37, 2, 2),
('correo056', 7, 7, 38, 3, 4),
('correo056', 15, 15, 49, 2, 4),
('correo056', 15, 15, 50, 3, 3),
('correo056', 15, 15, 51, 1, 1),
('correo056', 15, 15, 52, 1, 2),
('correo056', 15, 15, 53, 2, 2),
('correo056', 18, 18, 24, 1, 4),
('correo056', 18, 18, 25, 1, 1),
('correo056', 18, 18, 26, 2, 3),
('correo056', 18, 18, 27, 2, 3),
('correo056', 18, 18, 28, 2, 2),
('correo057', 7, 7, 34, 2, 3),
('correo057', 7, 7, 35, 1, 1),
('correo057', 7, 7, 36, 1, 2),
('correo057', 7, 7, 37, 2, 2),
('correo057', 7, 7, 38, 3, 4),
('correo058', 10, 20, 89, 2, 4),
('correo058', 10, 20, 90, 1, 3),
('correo058', 10, 20, 91, 1, 3),
('correo058', 10, 20, 92, 2, 3),
('correo058', 10, 20, 93, 2, 4),
('correo059', 4, 1, 54, 2, 2),
('correo059', 4, 1, 55, 1, 2),
('correo059', 4, 1, 56, 2, 3),
('correo059', 4, 1, 57, 1, 4),
('correo059', 4, 1, 58, 3, 3),
('correo059', 10, 9, 79, 1, 3),
('correo059', 10, 9, 80, 3, 4),
('correo059', 10, 9, 81, 2, 2),
('correo059', 10, 9, 82, 1, 1),
('correo059', 10, 9, 83, 1, 1),
('correo059', 12, 12, 104, 3, 4),
('correo059', 12, 12, 105, 1, 2),
('correo059', 12, 12, 106, 2, 2),
('correo059', 12, 12, 107, 1, 2),
('correo059', 12, 12, 108, 2, 4),
('correo059', 14, 25, 129, 3, 4),
('correo059', 14, 25, 130, 4, 5),
('correo059', 14, 25, 131, 1, 5),
('correo059', 14, 25, 132, 1, 1),
('correo059', 14, 25, 133, 1, 2),
('correo060', 6, 6, 44, 1, 3),
('correo060', 6, 6, 45, 3, 3),
('correo060', 6, 6, 46, 1, 4),
('correo060', 6, 6, 47, 1, 1),
('correo060', 6, 6, 48, 1, 1),
('correo060', 7, 7, 34, 3, 3),
('correo060', 7, 7, 35, 3, 4),
('correo060', 7, 7, 36, 1, 2),
('correo060', 7, 7, 37, 2, 3),
('correo060', 7, 7, 38, 1, 1),
('correo061', 10, 10, 84, 1, 3),
('correo061', 10, 10, 85, 1, 1),
('correo061', 10, 10, 86, 1, 3),
('correo061', 10, 10, 87, 2, 3),
('correo061', 10, 10, 88, 2, 3),
('correo061', 14, 26, 134, 3, 3),
('correo061', 14, 26, 135, 2, 3),
('correo061', 14, 26, 136, 1, 3),
('correo061', 14, 26, 137, 1, 5),
('correo061', 14, 26, 138, 4, 5),
('correo061', 18, 18, 24, 2, 4),
('correo061', 18, 18, 25, 1, 4),
('correo061', 18, 18, 26, 3, 3),
('correo061', 18, 18, 27, 1, 1),
('correo061', 18, 18, 28, 1, 3),
('correo062', 10, 20, 89, 3, 3),
('correo062', 10, 20, 90, 2, 2),
('correo062', 10, 20, 91, 3, 3),
('correo062', 10, 20, 92, 1, 1),
('correo062', 10, 20, 93, 1, 3),
('correo062', 12, 21, 109, 1, 1),
('correo062', 12, 21, 110, 1, 1),
('correo062', 12, 21, 111, 3, 3),
('correo062', 12, 21, 112, 2, 2),
('correo062', 12, 21, 113, 1, 1),
('correo062', 14, 14, 1, 1, 3),
('correo062', 14, 14, 2, 2, 3),
('correo062', 14, 14, 3, 2, 2),
('correo062', 14, 14, 4, 1, 1),
('correo062', 14, 14, 5, 1, 2),
('correo062', 14, 14, 6, 3, 4),
('correo062', 14, 14, 7, 1, 2),
('correo062', 14, 14, 8, 2, 5),
('correo062', 14, 14, 9, 3, 4),
('correo062', 14, 14, 10, 3, 3),
('correo062', 14, 14, 11, 1, 1),
('correo062', 14, 14, 12, 1, 5),
('correo062', 14, 14, 13, 1, 3),
('correo062', 16, 16, 39, 1, 1),
('correo062', 16, 16, 40, 2, 3),
('correo062', 16, 16, 41, 2, 2),
('correo062', 16, 16, 42, 3, 4),
('correo062', 16, 16, 43, 3, 3),
('correo063', 1, 2, 59, 1, 1),
('correo063', 1, 2, 60, 1, 2),
('correo063', 1, 2, 61, 2, 2),
('correo063', 1, 2, 62, 3, 4),
('correo063', 1, 2, 63, 2, 2),
('correo063', 8, 23, 119, 3, 3),
('correo063', 8, 23, 120, 4, 5),
('correo063', 8, 23, 121, 2, 2),
('correo063', 8, 23, 122, 1, 1),
('correo063', 8, 23, 123, 1, 3),
('correo063', 10, 9, 79, 1, 2),
('correo063', 10, 9, 80, 1, 2),
('correo063', 10, 9, 81, 1, 2),
('correo063', 10, 9, 82, 1, 2),
('correo063', 10, 9, 83, 1, 1),
('correo063', 12, 22, 114, 3, 3),
('correo063', 12, 22, 115, 3, 3),
('correo063', 12, 22, 116, 1, 2),
('correo063', 12, 22, 117, 1, 2),
('correo063', 12, 22, 118, 1, 2),
('correo063', 15, 15, 49, 1, 2),
('correo063', 15, 15, 50, 2, 2),
('correo063', 15, 15, 51, 1, 4),
('correo063', 15, 15, 52, 1, 2),
('correo063', 15, 15, 53, 3, 4),
('correo064', 6, 6, 44, 1, 3),
('correo064', 6, 6, 45, 3, 3),
('correo064', 6, 6, 46, 3, 4),
('correo064', 6, 6, 47, 1, 1),
('correo064', 6, 6, 48, 3, 3),
('correo065', 12, 11, 99, 1, 3),
('correo065', 12, 11, 100, 2, 2),
('correo065', 12, 11, 101, 3, 3),
('correo065', 12, 11, 102, 1, 1),
('correo065', 12, 11, 103, 3, 3),
('correo065', 14, 25, 129, 1, 3),
('correo065', 14, 25, 130, 3, 3),
('correo065', 14, 25, 131, 1, 3),
('correo065', 14, 25, 132, 2, 3),
('correo065', 14, 25, 133, 3, 5),
('correo065', 18, 18, 24, 1, 2),
('correo065', 18, 18, 25, 2, 4),
('correo065', 18, 18, 26, 2, 2),
('correo065', 18, 18, 27, 1, 3),
('correo065', 18, 18, 28, 2, 3),
('correo065', 20, 9, 79, 2, 2),
('correo065', 20, 9, 80, 3, 3),
('correo065', 20, 9, 81, 1, 2),
('correo065', 20, 9, 82, 1, 3),
('correo065', 20, 9, 83, 3, 3),
('correo066', 5, 5, 29, 3, 4),
('correo066', 5, 5, 30, 1, 1),
('correo066', 5, 5, 31, 3, 3),
('correo066', 5, 5, 32, 1, 3),
('correo066', 5, 5, 33, 2, 3),
('correo066', 12, 12, 104, 2, 4),
('correo066', 12, 12, 105, 3, 3),
('correo066', 12, 12, 106, 1, 1),
('correo066', 12, 12, 107, 3, 3),
('correo066', 12, 12, 108, 1, 4),
('correo066', 14, 26, 134, 3, 3),
('correo066', 14, 26, 135, 2, 5),
('correo066', 14, 26, 136, 2, 4),
('correo066', 14, 26, 137, 1, 2),
('correo066', 14, 26, 138, 1, 3),
('correo066', 20, 10, 84, 1, 1),
('correo066', 20, 10, 85, 2, 3),
('correo066', 20, 10, 86, 1, 1),
('correo066', 20, 10, 87, 2, 2),
('correo066', 20, 10, 88, 1, 3),
('correo067', 7, 7, 34, 2, 2),
('correo067', 7, 7, 35, 2, 4),
('correo067', 7, 7, 36, 1, 2),
('correo067', 7, 7, 37, 2, 3),
('correo067', 7, 7, 38, 1, 3),
('correo068', 12, 21, 109, 2, 4),
('correo068', 12, 21, 110, 2, 4),
('correo068', 12, 21, 111, 2, 2),
('correo068', 12, 21, 112, 2, 2),
('correo068', 12, 21, 113, 1, 3),
('correo068', 20, 20, 89, 1, 3),
('correo068', 20, 20, 90, 1, 1),
('correo068', 20, 20, 91, 1, 1),
('correo068', 20, 20, 92, 1, 1),
('correo068', 20, 20, 93, 1, 4),
('correo070', 12, 22, 114, 1, 4),
('correo070', 12, 22, 115, 1, 2),
('correo070', 12, 22, 116, 3, 3),
('correo070', 12, 22, 117, 2, 4),
('correo070', 12, 22, 118, 1, 3),
('correo070', 14, 14, 1, 1, 1),
('correo070', 14, 14, 2, 4, 5),
('correo070', 14, 14, 3, 1, 3),
('correo070', 14, 14, 4, 1, 1),
('correo070', 14, 14, 5, 3, 4),
('correo070', 14, 14, 6, 1, 2),
('correo070', 14, 14, 7, 3, 3),
('correo070', 14, 14, 8, 3, 3),
('correo070', 14, 14, 9, 1, 1),
('correo070', 14, 14, 10, 2, 4),
('correo070', 14, 14, 11, 4, 4),
('correo070', 14, 14, 12, 1, 3),
('correo070', 14, 14, 13, 2, 2),
('correo070', 20, 9, 79, 2, 2),
('correo070', 20, 9, 80, 2, 3),
('correo070', 20, 9, 81, 1, 1),
('correo070', 20, 9, 82, 1, 4),
('correo070', 20, 9, 83, 1, 1),
('correo071', 2, 4, 69, 1, 4),
('correo071', 2, 4, 70, 2, 2),
('correo071', 2, 4, 71, 1, 3),
('correo071', 2, 4, 72, 3, 3),
('correo071', 2, 4, 73, 3, 3),
('correo071', 8, 23, 119, 3, 3),
('correo071', 8, 23, 120, 1, 1),
('correo071', 8, 23, 121, 1, 1),
('correo071', 8, 23, 122, 3, 4),
('correo071', 8, 23, 123, 3, 3),
('correo071', 14, 25, 129, 4, 4),
('correo071', 14, 25, 130, 1, 1),
('correo071', 14, 25, 131, 1, 3),
('correo071', 14, 25, 132, 1, 2),
('correo071', 14, 25, 133, 1, 2),
('correo071', 20, 10, 84, 3, 4),
('correo071', 20, 10, 85, 1, 1),
('correo071', 20, 10, 86, 3, 4),
('correo071', 20, 10, 87, 1, 2),
('correo071', 20, 10, 88, 1, 2),
('correo072', 3, 1, 54, 2, 3),
('correo072', 3, 1, 55, 1, 2),
('correo072', 3, 1, 56, 2, 3),
('correo072', 3, 1, 57, 1, 3),
('correo072', 3, 1, 58, 1, 2),
('correo072', 20, 20, 89, 1, 2),
('correo072', 20, 20, 90, 1, 1),
('correo072', 20, 20, 91, 1, 3),
('correo072', 20, 20, 92, 3, 3),
('correo072', 20, 20, 93, 3, 4),
('correo072', 21, 1, 54, 1, 4),
('correo072', 21, 1, 55, 2, 2),
('correo072', 21, 1, 56, 2, 3),
('correo072', 21, 1, 57, 3, 3),
('correo072', 21, 1, 58, 2, 2),
('correo073', 12, 11, 99, 2, 2),
('correo073', 12, 11, 100, 1, 3),
('correo073', 12, 11, 101, 3, 4),
('correo073', 12, 11, 102, 1, 1),
('correo073', 12, 11, 103, 3, 3),
('correo073', 20, 9, 79, 3, 3),
('correo073', 20, 9, 80, 2, 2),
('correo073', 20, 9, 81, 3, 3),
('correo073', 20, 9, 82, 1, 4),
('correo073', 20, 9, 83, 3, 4),
('correo074', 12, 12, 104, 1, 1),
('correo074', 12, 12, 105, 1, 1),
('correo074', 12, 12, 106, 3, 4),
('correo074', 12, 12, 107, 1, 1),
('correo074', 12, 12, 108, 2, 2),
('correo074', 20, 10, 84, 2, 3),
('correo074', 20, 10, 85, 3, 4),
('correo074', 20, 10, 86, 1, 2),
('correo074', 20, 10, 87, 1, 2),
('correo074', 20, 10, 88, 1, 1),
('correo075', 4, 3, 64, 1, 2),
('correo075', 4, 3, 65, 2, 2),
('correo075', 4, 3, 66, 1, 2),
('correo075', 4, 3, 67, 2, 3),
('correo075', 4, 3, 68, 1, 1),
('correo075', 12, 21, 109, 1, 4),
('correo075', 12, 21, 110, 2, 4),
('correo075', 12, 21, 111, 1, 2),
('correo075', 12, 21, 112, 3, 3),
('correo075', 12, 21, 113, 1, 3),
('correo075', 18, 18, 24, 1, 2),
('correo075', 18, 18, 25, 3, 4),
('correo075', 18, 18, 26, 1, 2),
('correo075', 18, 18, 27, 1, 3),
('correo075', 18, 18, 28, 2, 3),
('correo075', 20, 20, 89, 2, 2),
('correo075', 20, 20, 90, 3, 3),
('correo075', 20, 20, 91, 1, 3),
('correo075', 20, 20, 92, 2, 2),
('correo075', 20, 20, 93, 3, 3),
('correo076', 7, 7, 34, 1, 1),
('correo076', 7, 7, 35, 2, 3),
('correo076', 7, 7, 36, 1, 1),
('correo076', 7, 7, 37, 1, 2),
('correo076', 7, 7, 38, 1, 2),
('correo077', 7, 7, 34, 1, 1),
('correo077', 7, 7, 35, 1, 3),
('correo077', 7, 7, 36, 1, 1),
('correo077', 7, 7, 37, 2, 3),
('correo077', 7, 7, 38, 2, 3),
('correo078', 1, 3, 64, 3, 3),
('correo078', 1, 3, 65, 2, 3),
('correo078', 1, 3, 66, 1, 2),
('correo078', 1, 3, 67, 1, 3),
('correo078', 1, 3, 68, 1, 1),
('correo078', 3, 2, 59, 1, 3),
('correo078', 3, 2, 60, 1, 2),
('correo078', 3, 2, 61, 3, 3),
('correo078', 3, 2, 62, 3, 4),
('correo078', 3, 2, 63, 1, 4),
('correo078', 7, 7, 34, 1, 4),
('correo078', 7, 7, 35, 2, 2),
('correo078', 7, 7, 36, 3, 4),
('correo078', 7, 7, 37, 1, 3),
('correo078', 7, 7, 38, 1, 2),
('correo078', 15, 15, 49, 2, 3),
('correo078', 15, 15, 50, 2, 3),
('correo078', 15, 15, 51, 1, 4),
('correo078', 15, 15, 52, 1, 1),
('correo078', 15, 15, 53, 1, 4),
('correo078', 18, 18, 24, 2, 2),
('correo078', 18, 18, 25, 1, 2),
('correo078', 18, 18, 26, 2, 2),
('correo078', 18, 18, 27, 2, 2),
('correo078', 18, 18, 28, 2, 4),
('correo078', 21, 2, 59, 2, 4),
('correo078', 21, 2, 60, 2, 3),
('correo078', 21, 2, 61, 1, 2),
('correo078', 21, 2, 62, 1, 3),
('correo078', 21, 2, 63, 2, 4),
('correo079', 2, 1, 54, 2, 4),
('correo079', 2, 1, 55, 1, 2),
('correo079', 2, 1, 56, 2, 3),
('correo079', 2, 1, 57, 2, 2),
('correo079', 2, 1, 58, 1, 1),
('correo079', 14, 26, 134, 4, 5),
('correo079', 14, 26, 135, 1, 3),
('correo079', 14, 26, 136, 3, 3),
('correo079', 14, 26, 137, 2, 4),
('correo079', 14, 26, 138, 1, 2),
('correo080', 12, 22, 114, 1, 4),
('correo080', 12, 22, 115, 3, 4),
('correo080', 12, 22, 116, 3, 4),
('correo080', 12, 22, 117, 2, 4),
('correo080', 12, 22, 118, 1, 4),
('correo080', 20, 9, 79, 2, 4),
('correo080', 20, 9, 80, 1, 1),
('correo080', 20, 9, 81, 3, 4),
('correo080', 20, 9, 82, 3, 3),
('correo080', 20, 9, 83, 1, 1),
('correo081', 3, 4, 69, 1, 1),
('correo081', 3, 4, 70, 1, 4),
('correo081', 3, 4, 71, 3, 4),
('correo081', 3, 4, 72, 1, 2),
('correo081', 3, 4, 73, 3, 3),
('correo081', 6, 6, 44, 2, 2),
('correo081', 6, 6, 45, 1, 2),
('correo081', 6, 6, 46, 2, 2),
('correo081', 6, 6, 47, 1, 2),
('correo081', 6, 6, 48, 1, 2),
('correo081', 12, 11, 99, 2, 2),
('correo081', 12, 11, 100, 1, 1),
('correo081', 12, 11, 101, 2, 4),
('correo081', 12, 11, 102, 2, 2),
('correo081', 12, 11, 103, 3, 3),
('correo081', 14, 14, 1, 2, 2),
('correo081', 14, 14, 2, 1, 4),
('correo081', 14, 14, 3, 2, 2),
('correo081', 14, 14, 4, 3, 4),
('correo081', 14, 14, 5, 1, 4),
('correo081', 14, 14, 6, 1, 3),
('correo081', 14, 14, 7, 1, 4),
('correo081', 14, 14, 8, 2, 4),
('correo081', 14, 14, 9, 3, 3),
('correo081', 14, 14, 10, 2, 3),
('correo081', 14, 14, 11, 1, 3),
('correo081', 14, 14, 12, 1, 3),
('correo081', 14, 14, 13, 4, 4),
('correo081', 21, 4, 69, 1, 4),
('correo081', 21, 4, 70, 1, 2),
('correo081', 21, 4, 71, 1, 1),
('correo081', 21, 4, 72, 1, 2),
('correo081', 21, 4, 73, 1, 3),
('correo082', 1, 2, 59, 3, 3),
('correo082', 1, 2, 60, 2, 4),
('correo082', 1, 2, 61, 2, 3),
('correo082', 1, 2, 62, 2, 3),
('correo082', 1, 2, 63, 3, 4),
('correo082', 14, 25, 129, 3, 3),
('correo082', 14, 25, 130, 1, 2),
('correo082', 14, 25, 131, 2, 4),
('correo082', 14, 25, 132, 1, 1),
('correo082', 14, 25, 133, 4, 4),
('correo082', 15, 15, 49, 2, 4),
('correo082', 15, 15, 50, 2, 3),
('correo082', 15, 15, 51, 3, 4),
('correo082', 15, 15, 52, 3, 3),
('correo082', 15, 15, 53, 2, 3),
('correo082', 20, 10, 84, 2, 3),
('correo082', 20, 10, 85, 3, 3),
('correo082', 20, 10, 86, 1, 1),
('correo082', 20, 10, 87, 2, 2),
('correo082', 20, 10, 88, 2, 2),
('correo083', 6, 6, 44, 1, 3),
('correo083', 6, 6, 45, 2, 2),
('correo083', 6, 6, 46, 2, 2),
('correo083', 6, 6, 47, 1, 3),
('correo083', 6, 6, 48, 2, 2),
('correo083', 15, 15, 49, 1, 1),
('correo083', 15, 15, 50, 1, 4),
('correo083', 15, 15, 51, 1, 2),
('correo083', 15, 15, 52, 1, 2),
('correo083', 15, 15, 53, 2, 2),
('correo083', 18, 18, 24, 2, 4),
('correo083', 18, 18, 25, 1, 2),
('correo083', 18, 18, 26, 2, 3),
('correo083', 18, 18, 27, 1, 1),
('correo083', 18, 18, 28, 1, 2),
('correo083', 20, 20, 89, 1, 1),
('correo083', 20, 20, 90, 1, 1),
('correo083', 20, 20, 91, 3, 3),
('correo083', 20, 20, 92, 2, 2),
('correo083', 20, 20, 93, 2, 3),
('correo085', 6, 6, 44, 3, 3),
('correo085', 6, 6, 45, 1, 2),
('correo085', 6, 6, 46, 2, 2),
('correo085', 6, 6, 47, 2, 2),
('correo085', 6, 6, 48, 1, 3),
('correo085', 18, 18, 24, 3, 4),
('correo085', 18, 18, 25, 1, 1),
('correo085', 18, 18, 26, 1, 3),
('correo085', 18, 18, 27, 1, 1),
('correo085', 18, 18, 28, 3, 3),
('correo086', 2, 2, 59, 3, 4),
('correo086', 2, 2, 60, 1, 2),
('correo086', 2, 2, 61, 1, 2),
('correo086', 2, 2, 62, 2, 2),
('correo086', 2, 2, 63, 3, 4),
('correo086', 8, 8, 14, 1, 2),
('correo086', 8, 8, 15, 2, 2),
('correo086', 8, 8, 16, 1, 1),
('correo086', 8, 8, 17, 2, 4),
('correo086', 8, 8, 18, 3, 4),
('correo086', 14, 26, 134, 1, 3),
('correo086', 14, 26, 135, 1, 2),
('correo086', 14, 26, 136, 1, 1),
('correo086', 14, 26, 137, 1, 2),
('correo086', 14, 26, 138, 1, 2),
('correo086', 15, 15, 49, 1, 3),
('correo086', 15, 15, 50, 2, 2),
('correo086', 15, 15, 51, 2, 4),
('correo086', 15, 15, 52, 1, 2),
('correo086', 15, 15, 53, 2, 2),
('correo086', 20, 9, 79, 2, 2),
('correo086', 20, 9, 80, 2, 4),
('correo086', 20, 9, 81, 3, 3),
('correo086', 20, 9, 82, 3, 4),
('correo086', 20, 9, 83, 3, 4),
('correo087', 12, 12, 104, 2, 2),
('correo087', 12, 12, 105, 1, 4),
('correo087', 12, 12, 106, 3, 3),
('correo087', 12, 12, 107, 1, 3),
('correo087', 12, 12, 108, 1, 3),
('correo087', 20, 10, 84, 1, 3),
('correo087', 20, 10, 85, 1, 2),
('correo087', 20, 10, 86, 1, 3),
('correo087', 20, 10, 87, 1, 3),
('correo087', 20, 10, 88, 1, 1),
('correo088', 5, 5, 29, 2, 2),
('correo088', 5, 5, 30, 3, 3),
('correo088', 5, 5, 31, 2, 3),
('correo088', 5, 5, 32, 1, 2),
('correo088', 5, 5, 33, 1, 1),
('correo088', 14, 14, 1, 4, 4),
('correo088', 14, 14, 2, 1, 2),
('correo088', 14, 14, 3, 1, 2),
('correo088', 14, 14, 4, 1, 3),
('correo088', 14, 14, 5, 1, 5),
('correo088', 14, 14, 6, 3, 4),
('correo088', 14, 14, 7, 2, 2),
('correo088', 14, 14, 8, 1, 3),
('correo088', 14, 14, 9, 3, 4),
('correo088', 14, 14, 10, 2, 2),
('correo088', 14, 14, 11, 3, 4),
('correo088', 14, 14, 12, 2, 2),
('correo088', 14, 14, 13, 2, 2),
('correo089', 7, 7, 34, 2, 2),
('correo089', 7, 7, 35, 1, 2),
('correo089', 7, 7, 36, 2, 3),
('correo089', 7, 7, 37, 3, 3),
('correo089', 7, 7, 38, 1, 3),
('correo090', 1, 4, 69, 2, 3),
('correo090', 1, 4, 70, 1, 4),
('correo090', 1, 4, 71, 2, 2),
('correo090', 1, 4, 72, 1, 4),
('correo090', 1, 4, 73, 2, 2),
('correo090', 7, 7, 34, 1, 2),
('correo090', 7, 7, 35, 2, 3),
('correo090', 7, 7, 36, 1, 1),
('correo090', 7, 7, 37, 3, 4),
('correo090', 7, 7, 38, 1, 2),
('correo090', 15, 15, 49, 2, 3),
('correo090', 15, 15, 50, 1, 2),
('correo090', 15, 15, 51, 1, 4),
('correo090', 15, 15, 52, 2, 3),
('correo090', 15, 15, 53, 1, 3),
('correo091', 4, 2, 59, 1, 1),
('correo091', 4, 2, 60, 3, 3),
('correo091', 4, 2, 61, 1, 1),
('correo091', 4, 2, 62, 2, 2),
('correo091', 4, 2, 63, 1, 2),
('correo091', 12, 21, 109, 1, 1),
('correo091', 12, 21, 110, 2, 3),
('correo091', 12, 21, 111, 1, 2),
('correo091', 12, 21, 112, 2, 2),
('correo091', 12, 21, 113, 1, 1),
('correo091', 14, 25, 129, 2, 4),
('correo091', 14, 25, 130, 2, 4),
('correo091', 14, 25, 131, 3, 4),
('correo091', 14, 25, 132, 2, 2),
('correo091', 14, 25, 133, 3, 5),
('correo091', 17, 17, 19, 2, 3),
('correo091', 17, 17, 20, 1, 2),
('correo091', 17, 17, 21, 3, 4),
('correo091', 17, 17, 22, 2, 2),
('correo091', 17, 17, 23, 2, 3),
('correo091', 20, 20, 89, 2, 4),
('correo091', 20, 20, 90, 2, 3),
('correo091', 20, 20, 91, 2, 2),
('correo091', 20, 20, 92, 2, 2),
('correo091', 20, 20, 93, 2, 2),
('correo092', 5, 5, 29, 1, 2),
('correo092', 5, 5, 30, 3, 4),
('correo092', 5, 5, 31, 1, 2),
('correo092', 5, 5, 32, 2, 2),
('correo092', 5, 5, 33, 1, 2),
('correo092', 14, 26, 134, 1, 4),
('correo092', 14, 26, 135, 1, 2),
('correo092', 14, 26, 136, 2, 2),
('correo092', 14, 26, 137, 3, 4),
('correo092', 14, 26, 138, 1, 1),
('correo092', 20, 9, 79, 2, 3),
('correo092', 20, 9, 80, 1, 1),
('correo092', 20, 9, 81, 1, 1),
('correo092', 20, 9, 82, 1, 1),
('correo092', 20, 9, 83, 3, 3),
('correo093', 12, 22, 114, 1, 2),
('correo093', 12, 22, 115, 1, 3),
('correo093', 12, 22, 116, 1, 1),
('correo093', 12, 22, 117, 2, 2),
('correo093', 12, 22, 118, 3, 4),
('correo093', 14, 14, 1, 2, 2),
('correo093', 14, 14, 2, 1, 1),
('correo093', 14, 14, 3, 2, 2),
('correo093', 14, 14, 4, 2, 2),
('correo093', 14, 14, 5, 2, 3),
('correo093', 14, 14, 6, 1, 4),
('correo093', 14, 14, 7, 1, 1),
('correo093', 14, 14, 8, 2, 2),
('correo093', 14, 14, 9, 1, 3),
('correo093', 14, 14, 10, 3, 3),
('correo093', 14, 14, 11, 3, 4),
('correo093', 14, 14, 12, 2, 3),
('correo093', 14, 14, 13, 1, 2),
('correo093', 20, 10, 84, 3, 3),
('correo093', 20, 10, 85, 2, 2),
('correo093', 20, 10, 86, 1, 2),
('correo093', 20, 10, 87, 2, 3),
('correo093', 20, 10, 88, 3, 3),
('correo094', 7, 7, 34, 2, 3),
('correo094', 7, 7, 35, 2, 2),
('correo094', 7, 7, 36, 1, 2),
('correo094', 7, 7, 37, 1, 3),
('correo094', 7, 7, 38, 1, 2),
('correo094', 15, 15, 49, 2, 2),
('correo094', 15, 15, 50, 3, 3),
('correo094', 15, 15, 51, 3, 3),
('correo094', 15, 15, 52, 2, 2),
('correo094', 15, 15, 53, 1, 1),
('correo095', 8, 23, 119, 2, 3),
('correo095', 8, 23, 120, 2, 5),
('correo095', 8, 23, 121, 4, 5),
('correo095', 8, 23, 122, 2, 2),
('correo095', 8, 23, 123, 2, 3),
('correo095', 12, 11, 99, 1, 3),
('correo095', 12, 11, 100, 3, 4),
('correo095', 12, 11, 101, 3, 4),
('correo095', 12, 11, 102, 2, 3),
('correo095', 12, 11, 103, 2, 3),
('correo095', 15, 15, 49, 1, 1),
('correo095', 15, 15, 50, 1, 3),
('correo095', 15, 15, 51, 1, 4),
('correo095', 15, 15, 52, 1, 2),
('correo095', 15, 15, 53, 1, 2),
('correo095', 20, 20, 89, 2, 3),
('correo095', 20, 20, 90, 1, 3),
('correo095', 20, 20, 91, 1, 1),
('correo095', 20, 20, 92, 1, 2),
('correo095', 20, 20, 93, 3, 3),
('correo096', 7, 7, 34, 1, 1),
('correo096', 7, 7, 35, 2, 2),
('correo096', 7, 7, 36, 3, 4),
('correo096', 7, 7, 37, 1, 3),
('correo096', 7, 7, 38, 3, 3),
('correo096', 18, 18, 24, 1, 2),
('correo096', 18, 18, 25, 2, 2),
('correo096', 18, 18, 26, 3, 4),
('correo096', 18, 18, 27, 1, 4),
('correo096', 18, 18, 28, 3, 3),
('correo097', 15, 15, 49, 2, 2),
('correo097', 15, 15, 50, 2, 4),
('correo097', 15, 15, 51, 3, 4),
('correo097', 15, 15, 52, 2, 3),
('correo097', 15, 15, 53, 1, 1),
('correo097', 20, 9, 79, 3, 3),
('correo097', 20, 9, 80, 3, 4),
('correo097', 20, 9, 81, 3, 4),
('correo097', 20, 9, 82, 1, 1),
('correo097', 20, 9, 83, 1, 1),
('correo098', 7, 7, 34, 2, 3),
('correo098', 7, 7, 35, 2, 4),
('correo098', 7, 7, 36, 1, 3),
('correo098', 7, 7, 37, 3, 3),
('correo098', 7, 7, 38, 2, 3),
('correo099', 7, 7, 34, 3, 3),
('correo099', 7, 7, 35, 2, 4),
('correo099', 7, 7, 36, 2, 3),
('correo099', 7, 7, 37, 1, 1),
('correo099', 7, 7, 38, 2, 2),
('correo101', 2, 2, 59, 1, 3),
('correo101', 2, 2, 60, 2, 3),
('correo101', 2, 2, 61, 2, 4),
('correo101', 2, 2, 62, 3, 3),
('correo101', 2, 2, 63, 2, 2),
('correo101', 18, 18, 24, 1, 1),
('correo101', 18, 18, 25, 3, 3),
('correo101', 18, 18, 26, 1, 3),
('correo101', 18, 18, 27, 2, 2),
('correo101', 18, 18, 28, 1, 1);
INSERT INTO `participantes_grupos_objetivo` (`login`, `idGrupo`, `idNivel`, `idObjetivo`, `puntajeInicial`, `puntajeFinal`) VALUES
('correo102', 18, 18, 24, 3, 3),
('correo102', 18, 18, 25, 1, 1),
('correo102', 18, 18, 26, 1, 2),
('correo102', 18, 18, 27, 2, 3),
('correo102', 18, 18, 28, 2, 4),
('correo103', 2, 1, 54, NULL, NULL),
('correo103', 2, 1, 55, NULL, NULL),
('sandyts', 2, 1, 54, NULL, NULL),
('sandyts', 2, 1, 55, NULL, NULL),
('sandyts', 2, 1, 56, NULL, NULL),
('sandyts', 2, 1, 57, NULL, NULL),
('sandyts', 2, 1, 58, NULL, NULL),
('sandyts', 32, 5, 30, NULL, NULL),
('sandyts', 32, 5, 31, NULL, NULL),
('sandyts', 32, 5, 32, NULL, NULL),
('sandyts', 32, 5, 33, NULL, NULL),
('sandyts', 32, 5, 164, NULL, NULL),
('sandyts', 32, 5, 165, NULL, NULL),
('sandyts', 32, 5, 166, NULL, NULL),
('sandyts', 32, 5, 168, NULL, NULL),
('sandyts', 32, 5, 169, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
--

CREATE TABLE `programas` (
  `idPrograma` int(11) NOT NULL,
  `nombrePrograma` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `puntajeMaximo` int(11) NOT NULL,
  `dirImagen` varchar(100) COLLATE utf8mb4_spanish2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `programas`
--

INSERT INTO `programas` (`idPrograma`, `nombrePrograma`, `puntajeMaximo`, `dirImagen`) VALUES
(1, 'Lenguaje', 5, 'uploads\\imagenes\\_DSC6015.jpg'),
(2, 'Baile', 5, 'uploads\\imagenes\\4_866_baile.jpg'),
(3, 'Brinco salto y corro', 4, 'uploads\\imagenes\\4_757_brincosaltocorro.jpg'),
(4, 'Gateo y caminata', 4, 'uploads\\imagenes\\4_254__DSC5949-2.jpg'),
(5, 'Terapia ocupacional', 4, 'uploads\\imagenes\\4_244_ocupacional.jpg'),
(6, 'Lectura', 4, 'uploads\\imagenes\\4_120_Lectura.jpg'),
(7, 'Matemáticas', 4, 'uploads\\imagenes\\4_415_mate.jpg'),
(8, 'Escritura', 4, 'uploads\\imagenes\\4_91__DSC6182.jpg'),
(9, 'Habilidades sociales', 4, 'uploads\\imagenes\\4_71__DSC5674.jpg'),
(10, 'Terapia sensorial', 4, 'uploads\\imagenes\\4_395_sensorial.jpg'),
(11, 'Cocina', 4, 'uploads\\imagenes\\4_846_cocinaa.jpg'),
(12, 'Soy Productivo', 4, 'uploads\\imagenes\\4_509__DSC6162.jpg'),
(13, 'Orofacial', 4, 'uploads\\imagenes\\4_648_brincosaltocorro.jpg'),
(14, 'Ballet', 4, 'uploads\\imagenes\\imagen14.jpg'),
(15, 'Equinoterapia', 4, 'uploads\\imagenes\\imagen15.jpg'),
(16, 'Gimnasia rítmica', 4, 'uploads\\imagenes\\imagen16.jpg'),
(17, 'Postural', 4, 'uploads\\imagenes\\imagen17.jpg'),
(18, 'Para tae-kwondo', 4, 'uploads\\imagenes\\imagen18.jpg'),
(19, 'Lenguaje musica y gestos', 5, 'uploads\\imagenes\\4_777_musica.jpg'),
(20, 'Preescritura', 4, 'uploads\\imagenes\\imagen20.jpg'),
(28, 'Música', 4, 'uploads\\imagenes\\4_539_musica.jpg'),
(30, 'Brincos', 0, 'uploads\\imagenes\\4_114_gestion admin gigis (4).png'),
(32, 'Música', 5, 'uploads\\imagenes\\4_927_AApUEUc.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `idRol` int(11) NOT NULL,
  `nombre` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`idRol`, `nombre`) VALUES
(1, 'participante'),
(2, 'terapeuta '),
(3, 'gestor'),
(4, 'administrador'),
(8, 'Líder');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles_funciones`
--

CREATE TABLE `roles_funciones` (
  `idRol` int(11) NOT NULL,
  `idfuncion` int(11) NOT NULL,
  `fechaRF` DATETIME NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `roles_funciones`
--

INSERT INTO `roles_funciones` (`idRol`, `idfuncion`, `fechaRF`) VALUES
(1, 15, '0000-00-00'),
(4, 1, '2021-06-01'),
(4, 2, '2021-06-01'),
(4, 3, '2021-06-01'),
(4, 4, '2021-06-01'),
(4, 5, '2021-06-01'),
(4, 6, '2021-06-01'),
(4, 7, '2021-06-01'),
(4, 8, '2021-06-01'),
(4, 9, '2021-06-01'),
(4, 10, '2021-06-01'),
(4, 11, '2021-06-01'),
(4, 12, '2021-06-01'),
(4, 13, '2021-06-01'),
(4, 14, '2021-06-01'),
(4, 15, '2021-06-01'),
(4, 16, '2021-06-01'),
(4, 17, '2021-06-01'),
(4, 18, '2021-06-01'),
(4, 19, '2021-06-01'),
(4, 20, '2021-06-01'),
(4, 21, '2021-06-01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `terapeutas`
--

CREATE TABLE `terapeutas` (
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `titulo` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `cv` varchar(200) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `estatus` char(1) COLLATE utf8mb4_spanish2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `terapeutas`
--

INSERT INTO `terapeutas` (`login`, `titulo`, `cv`, `estatus`) VALUES
('agonzalez@gigisplayhouse.org', NULL, NULL, 'B'),
('alondra@gmail.com', NULL, NULL, 'A'),
('ccano@gigisplayhouse.org', NULL, NULL, 'A'),
('garistoy@gigisplayhouse.org', NULL, NULL, 'A'),
('gonzalo@hotmail.com', NULL, NULL, 'A'),
('jmartinez@gigisplayhouse.org', NULL, NULL, 'A'),
('karias@gigisplayhouse.org', NULL, NULL, 'A'),
('lazuara@gigisplayhouse.org', NULL, NULL, 'A'),
('mcristina@gigisplayhouse.org', NULL, NULL, 'A'),
('mnajera@gigisplayhouse.org', NULL, NULL, 'A'),
('ptornell@gigisplayhouse.org', NULL, NULL, 'A'),
('vgarcia@gigisplayhouse.org', NULL, NULL, 'A'),
('vsaracho@gigisplayhouse.org', NULL, NULL, 'A');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `password` varchar(250) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `nombreUsuario` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `apellidoPaterno` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `apellidoMaterno` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`login`, `password`, `nombreUsuario`, `apellidoPaterno`, `apellidoMaterno`) VALUES
('agonzalez@gigisplayhouse.org', 'gonzalez123+', 'Alejandra', 'González', 'null'),
('alondra@gmail.com', '$2a$12$6qtYNNv2RxCZa/k2c9JGVerut5YLUaLMtF/YMsEyBq0Y/7YHWA0b.', 'Alondra', 'López', 'Vera'),
('andrea@correo.com', '$2a$12$iysEFv1KWXczA8RuowLK4e39Ra7SASPtzueOyozqeER.QUtycExs.', 'Andrea', 'López', 'Vera'),
('andreascvfg@correo.com', '$2a$12$ZVzS69.qUYVW0iUwJmB4Ye4WmMsuyLZAUkOUDFHyGLY.lLSSvPWb6', 'Andrea', 'López', 'Vera'),
('ccano@gigisplayhouse.org', 'cano123+', 'Carolina', 'Cano', 'Lara'),
('correo001', 'contra001', 'Adriana Guadalupe', 'Pérez', 'Hernández'),
('correo002', 'contra002', 'Alan Eduardo', 'Anaya', 'Flores'),
('correo003', 'contra003', 'Alejandro Vangelis', 'Soberanis', 'Lannoy'),
('correo004', 'contra004', 'Alexa Nicole', 'Soto', 'Pérez'),
('correo005', 'contra005', 'Alexander', 'Hernández', 'Vargas'),
('correo006', 'contra006', 'Alma Angélica', 'Gaspar', 'Castañeda'),
('correo007', 'contra007', 'Ana del Carmen', 'Pichardo', 'García'),
('correo008', 'contra008', 'Ana María', 'Pérez', 'Barba'),
('correo009', 'contra009', 'Ana Sayurí', 'Olvera', 'Rico'),
('correo010', 'contra010', 'Ángel André', 'Dunzz', 'Sanders Romero'),
('correo011', 'contra011', 'Ángel Miguel', 'Rodríguez', 'Franco'),
('correo012', 'contra012', 'Angélica Itzel', 'Garrido', 'Rosas'),
('correo013', 'contra013', 'Anna Julieta', 'García', 'Lugo'),
('correo014', 'contra014', 'Aranza', 'Solórzano', 'Watson'),
('correo015', 'contra015', 'Arturo', 'Verdugo', 'Olvera'),
('correo016', 'contra016', 'Bruno Tadeo', 'Montes de Oca', 'González'),
('correo017', 'contra017', 'Cristian Alejandro', 'Ledesma', 'Hernández'),
('correo018', 'contra018', 'Cristian Tadeo', 'Arias', 'Sánchez'),
('correo019', 'contra019', 'Daniel Esteban', 'López', 'Allende'),
('correo020', 'contra020', 'Daniela Sarahí', 'Aldape', 'García'),
('correo021', 'contra021', 'Dario', 'Gabriel', 'López'),
('correo022', 'contra022', 'David', 'Corzo', 'González'),
('correo023', 'contra023', 'David', 'Vega', 'Portillo'),
('correo024', 'contra024', 'Demi Sofia', 'Cruz', 'Soto'),
('correo025', 'contra025', 'Diana', 'Canul', 'Pelayo'),
('correo026', 'contra026', 'Diana', 'Zamora', 'Morales'),
('correo027', 'contra027', 'Diego', 'Barrón', 'Martínez'),
('correo028', 'contra028', 'Diego Gabriel', 'Sánchez', 'Olvera'),
('correo029', 'contra029', 'Diego', 'Ramírez', 'López'),
('correo030', 'contra030', 'Dulce Guadalupe', 'Espinoza', 'Jorge'),
('correo031', 'contra031', 'Dulce María', 'Hernández', 'García'),
('correo032', 'contra032', 'Emiliano', 'Ruiz', 'null'),
('correo033', 'contra033', 'Erasmo Gabriel', 'Huerta', 'Rivera'),
('correo034', 'contra034', 'Erik Yair', 'Matehuala', 'Trejo'),
('correo035', 'contra035', 'Francisco Alejandro', 'Peña', 'Ferrer'),
('correo036', 'contra036', 'Franco', 'Vasquez', 'Sánchez'),
('correo037', 'contra037', 'Gabriel', 'Rojas', 'Tinoco'),
('correo038', 'contra038', 'Guadalupe', 'Gonzalez', 'Grimaldi'),
('correo039', 'contra039', 'Iker', 'Gutierrez', 'null '),
('correo040', 'contra040', 'Iker', 'Juárez', 'Castillo'),
('correo041', 'contra041', 'Iker Ramón', 'Murúa', 'Ledesma'),
('correo042', 'contra042', 'Ingrid Alexa', 'Reséndiz', 'Fernando'),
('correo043', 'contra043', 'Isaac', 'Carvajal', 'Urbina'),
('correo044', 'contra044', 'Isaac', 'Delgado', 'Nieves'),
('correo045', 'contra045', 'Isaac Enrique', 'Gutierrez', 'Centeno'),
('correo046', 'contra046', 'Isabella', 'Reyes', 'Cortés'),
('correo047', 'contra047', 'Isaías', 'Ramírez', 'Manzano'),
('correo048', 'contra048', 'Ismael', ' Rodríguez', 'Granada Vazquez'),
('correo049', 'contra049', 'Jessica', 'Olalde', 'Rosas'),
('correo050', 'contra050', 'José Emanuel', 'Zarazua', 'Uribe'),
('correo051', 'contra051', 'Jose Miguel', 'Esquivel', 'Orozco'),
('correo052', 'contra052', 'Josi Kaylani', 'Ávalos', 'Irenia'),
('correo053', 'contra053', 'Juan Pablo', 'Martínez', 'Martínez'),
('correo054', 'contra054', 'Keyla Meltem', 'Sánchez', 'Prianti'),
('correo055', 'contra055', 'Keyli Milagros', 'Arias', 'Aguillón'),
('correo056', 'contra056', 'Killian Abdias', 'Torres', 'Estrada'),
('correo057', 'contra057', 'Leonardo', 'Jesús', 'null'),
('correo058', 'contra058', 'Luis Carlos', 'Guirón', 'Soria '),
('correo059', 'contra059', 'Luis Esteban', 'Ricalde', 'Chávez'),
('correo060', 'contra060', 'Luz Maria', 'Moreno', 'Alvarez'),
('correo061', 'contra061', 'Malik', 'Fajardo', 'López'),
('correo062', 'contra062', 'Maria de Jesús', 'Medina', 'Arreguín'),
('correo063', 'contra063', 'Maria José', 'Virgilio', 'Sanchez'),
('correo064', 'contra064', 'María Ximena', 'Pastenes', 'Camacho'),
('correo065', 'contra065', 'Mariana', 'Zamora', 'Cruz'),
('correo066', 'contra066', 'Mateo', 'De La Llata', 'Simroth'),
('correo067', 'contra067', 'Matías', 'Mejia', 'Pérez'),
('correo068', 'contra068', 'Matías', 'Mercado', 'Ceja'),
('correo069', 'contra069', 'Matteo', 'Aguilar', 'Resendiz '),
('correo070', 'contra070', 'Mauricio', 'Flores', 'Avilés'),
('correo071', 'contra071', 'Maximiliano', 'López', 'Estrada'),
('correo072', 'contra072', 'Melissa', 'Salazar', 'Hernández'),
('correo073', 'contra073', 'Mildreth Daniela', 'Martínez', 'Gómez'),
('correo074', 'contra074', 'Moriah Yolotzin', 'Hernández', 'Gudinio'),
('correo075', 'contra075', 'Naomi', 'Pero', 'González'),
('correo076', 'contra076', 'Orlando', 'Mendoza', 'Castañedas'),
('correo077', 'contra077', 'Oziel Emanuel', 'Velázquez', 'Martínez'),
('correo078', 'contra078', 'Pablo', 'Santiago', 'Ibarra'),
('correo079', 'contra079', 'Pilar', 'Torres', 'Muñoz'),
('correo080', 'contra080', 'Regina', 'Guerrero', 'Sánchez'),
('correo081', 'contra081', 'Regina', 'Miranda', 'Mendoza'),
('correo082', 'contra082', 'Renata', 'Rojas', 'Alvarado'),
('correo083', 'contra083', 'Rodrigo Ernesto', 'Guevara', 'Juárez'),
('correo084', 'contra084', 'Rodrigo', 'Jiménez', 'Medina'),
('correo085', 'contra085', 'Romina', 'Guadalupe', 'Hidalgo'),
('correo086', 'contra086', 'Samantha', 'Molina', 'Bárcenas'),
('correo087', 'contra087', 'Samuel Isaac', 'Juárez', 'Icedo'),
('correo088', 'contra088', 'Santiago', 'Garduño', 'Rosillo'),
('correo089', 'contra089', 'Santiago Jesús', 'Hernández', 'Bolaños'),
('correo090', 'contra090', 'Santiago', 'Velasco', 'Plata'),
('correo091', 'contra091', 'Sofia', 'Ayala', 'Terrones'),
('correo092', 'contra092', 'Sofia', 'Rivera', 'Aguilar'),
('correo093', 'contra093', 'Teresa Joselin', 'Flores', 'Soto'),
('correo094', 'contra094', 'Valentina', 'González', 'Escobar'),
('correo095', 'contra095', 'Valeria Andreina', 'Martínez', 'Jiménez'),
('correo096', 'contra096', 'Vanya Itzel', 'Rodríguez', 'Cachua'),
('correo097', 'contra097', 'Víctor Antonio', 'Martínez', 'Olguín'),
('correo098', 'contra098', 'Xóchitl Itzel', 'Mendoza', 'Morales'),
('correo099', 'contra099', 'Yerik Abdiel', 'Solis', 'Ascencio'),
('correo100', 'contra100', 'Zaid', 'Chávez', 'Loyola'),
('correo101', 'contra101', 'Zaira', 'Guadalupe', 'Olvera'),
('correo102', 'contra102', 'Zoe Xareni', 'Ponce', 'González'),
('correo103', 'contra103', 'Valeria', 'Trolle', 'Rodríguez'),
('ebarba@gigisplayhouse.org', 'barba123+', 'Eva', 'Barba', 'null'),
('emiliano@gmail.com', '$2a$12$L9p3yhE5liO.z3doz99oi.oYYT.S6UZk9oaPYB0Frn0Nk8q2UWuy2', 'Emiliano', 'López', 'Vera'),
('garistoy@gigisplayhouse.org', 'gaby123+', 'Gabriela', 'Aristoy', 'Torres'),
('gonzalo@hotmail.com', '$2a$12$KDplNzppgPLyEJmtQ7JZXuLHstfCXptS4y/eNSvTGdSi869rQTd52', 'Sandra', 'Tello', 'Salinas'),
('jmartinez@gigisplayhouse.org', 'martinez123+', 'Jacob', 'Martínez', 'Chávez'),
('karias@gigisplayhouse.org', 'arias123+', 'Karime', 'Arias', 'null'),
('lazuara@gigisplayhouse.org', 'azuara123+', 'Ligia', 'Azuara', 'null'),
('maguilar@gigisplayhouse.org', 'aguilar123+', 'Mayela', 'Aguilar', 'null'),
('mcristina@gigisplayhouse.org', 'medina123+', 'Cristina', 'Medina', 'null'),
('mnajera@gigisplayhouse.org', 'najera123+', 'Marcela', 'Najera', 'Vilches'),
('ptornell@gigisplayhouse.org', 'tornell123+', 'Paula', 'Tornell', 'Pantoja'),
('sandra@hotmail.com', '$2a$12$opSzIUOqyS1hlYR5CPXvWOBoDUYG6AXjlHr3weEV3E1DMl0JE9PE2', 'Sandra', 'Tello', 'Salinas'),
('sandrateedasdaslo@gmail.com', '$2a$12$HxjK7qP7VTjVzfQnM3VD.e6MQFAr3WUS0GlIKk0W3Kne3tvm5utlW', 'Andrea', 'López', 'Vera'),
('sandrateelo@gmail.com', '$2a$12$TxVOcrsDzuutjCn6NRr28.fUAexB2s/yoVgM0MLuDhPCaDzRFz/Di', 'Andrea', 'López', 'Vera'),
('sandratello', '$2a$12$6Xv0eZdHgg9I9QX3/riJ6Oh8LxlO46FMoOWDUt4fSTzOkRITBmkdW', 'Andrea', 'López', 'Vera'),
('sandratesdelo@gmail.com', '$2a$12$mKtUZIIptP5LSIBVGVKFTu6VAVaElxScXaJztHm85ER3eUytdzLte', 'Andrea', 'López', 'Vera'),
('sandy', '$2a$12$8Y28KrGbtBLFRUz31mZH1.dd9bxumOB2RVLkFIHfWABonL.pq0qcC', 'Andrea', 'López', 'Vera'),
('sandyts', '$2a$12$oX7uymmPhs0mtTGeCFUxYuD6AqUoovFjO3aK2kjYFaFOLRLTnDP96', 'Sandra', 'López', 'Tello'),
('vgarcia@gigisplayhouse.org', 'garcia123+', 'Verónica', 'García', 'null'),
('vsaracho@gigisplayhouse.org', 'saracho123+', 'Valentina', 'Saracho', 'Pitol');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_roles`
--

CREATE TABLE `usuarios_roles` (
  `login` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `idRol` int(11) NOT NULL,
  `fechaUR` DATETIME NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `usuarios_roles`
--

INSERT INTO `usuarios_roles` (`login`, `idRol`, `fechaUR`) VALUES
('alondra@gmail.com', 2, '2021-05-31'),
('andrea@correo.com', 3, '2021-05-31'),
('andrea@correo.com', 4, '2021-05-31'),
('andreascvfg@correo.com', 1, '2021-05-13'),
('ccano@gigisplayhouse.org', 2, '2021-04-12'),
('correo001', 1, '2021-04-16'),
('correo002', 1, '2021-04-17'),
('correo003', 1, '2021-04-18'),
('correo004', 1, '2021-04-19'),
('correo005', 1, '2021-04-20'),
('correo006', 1, '2021-04-21'),
('correo007', 1, '2021-04-22'),
('correo008', 1, '2021-04-23'),
('correo009', 1, '2021-04-24'),
('correo010', 1, '2021-04-25'),
('correo011', 1, '2021-04-26'),
('correo012', 1, '2021-04-27'),
('correo013', 1, '2021-04-28'),
('correo014', 1, '2021-04-29'),
('correo015', 1, '2021-04-30'),
('correo016', 1, '2021-05-01'),
('correo017', 1, '2021-05-02'),
('correo018', 1, '2021-05-03'),
('correo019', 1, '2021-05-04'),
('correo020', 1, '2021-05-05'),
('correo021', 1, '2021-05-06'),
('correo022', 1, '2021-05-07'),
('correo023', 1, '2021-05-08'),
('correo024', 1, '2021-05-09'),
('correo025', 1, '2021-05-10'),
('correo026', 1, '2021-05-11'),
('correo027', 1, '2021-05-12'),
('correo028', 1, '2021-05-13'),
('correo029', 1, '2021-05-14'),
('correo030', 1, '2021-05-15'),
('correo031', 1, '2021-05-16'),
('correo032', 1, '2021-05-17'),
('correo033', 1, '2021-05-18'),
('correo034', 1, '2021-05-19'),
('correo035', 1, '2021-05-20'),
('correo036', 1, '2021-05-21'),
('correo037', 1, '2021-05-22'),
('correo038', 1, '2021-05-23'),
('correo039', 1, '2021-05-24'),
('correo040', 1, '2021-05-25'),
('correo041', 1, '2021-05-26'),
('correo042', 1, '2021-05-27'),
('correo043', 1, '2021-05-28'),
('correo044', 1, '2021-05-29'),
('correo045', 1, '2021-05-30'),
('correo046', 1, '2021-05-31'),
('correo047', 1, '2021-06-01'),
('correo048', 1, '2021-06-02'),
('correo049', 1, '2021-06-03'),
('correo050', 1, '2021-06-04'),
('correo051', 1, '2021-06-05'),
('correo052', 1, '2021-06-06'),
('correo053', 1, '2021-06-07'),
('correo054', 1, '2021-06-08'),
('correo055', 1, '2021-06-09'),
('correo056', 1, '2021-06-10'),
('correo057', 1, '2021-06-11'),
('correo058', 1, '2021-06-12'),
('correo059', 1, '2021-06-13'),
('correo060', 1, '2021-06-14'),
('correo061', 1, '2021-06-15'),
('correo062', 1, '2021-06-16'),
('correo063', 1, '2021-06-17'),
('correo064', 1, '2021-06-18'),
('correo065', 1, '2021-06-19'),
('correo066', 1, '2021-06-20'),
('correo067', 1, '2021-06-21'),
('correo068', 1, '2021-06-22'),
('correo069', 1, '2021-06-23'),
('correo070', 1, '2021-06-24'),
('correo071', 1, '2021-06-25'),
('correo072', 1, '2021-06-26'),
('correo073', 1, '2021-06-27'),
('correo074', 1, '2021-06-28'),
('correo075', 1, '2021-06-29'),
('correo076', 1, '2021-06-30'),
('correo077', 1, '2021-07-01'),
('correo078', 1, '2021-07-02'),
('correo079', 1, '2021-07-03'),
('correo080', 1, '2021-07-04'),
('correo081', 1, '2021-07-05'),
('correo082', 1, '2021-07-06'),
('correo083', 1, '2021-07-07'),
('correo084', 1, '2021-07-08'),
('correo085', 1, '2021-07-09'),
('correo086', 1, '2021-07-10'),
('correo087', 1, '2021-07-11'),
('correo088', 1, '2021-07-12'),
('correo089', 1, '2021-07-13'),
('correo090', 1, '2021-07-14'),
('correo091', 1, '2021-07-15'),
('correo092', 1, '2021-07-16'),
('correo093', 1, '2021-07-17'),
('correo094', 1, '2021-07-18'),
('correo095', 1, '2021-07-19'),
('correo096', 1, '2021-07-20'),
('correo097', 1, '2021-07-21'),
('correo098', 1, '2021-07-22'),
('correo099', 1, '2021-07-23'),
('correo100', 1, '2021-07-24'),
('correo101', 1, '2021-07-25'),
('correo102', 1, '2021-07-26'),
('correo103', 1, '2021-07-27'),
('ebarba@gigisplayhouse.org', 3, '2021-04-15'),
('emiliano@gmail.com', 3, '2021-05-09'),
('garistoy@gigisplayhouse.org', 2, '2021-04-04'),
('gonzalo@hotmail.com', 2, '2021-05-31'),
('gonzalo@hotmail.com', 3, '2021-05-31'),
('jmartinez@gigisplayhouse.org', 2, '2021-05-30'),
('karias@gigisplayhouse.org', 2, '2021-04-08'),
('lazuara@gigisplayhouse.org', 2, '2021-04-10'),
('maguilar@gigisplayhouse.org', 4, '2021-04-14'),
('mcristina@gigisplayhouse.org', 2, '2021-04-05'),
('mnajera@gigisplayhouse.org', 2, '2021-04-03'),
('ptornell@gigisplayhouse.org', 2, '2021-04-09'),
('sandra@hotmail.com', 4, '0000-00-00'),
('sandratello', 1, '2021-05-17'),
('sandyts', 1, '2021-06-01'),
('vgarcia@gigisplayhouse.org', 2, '2021-04-11'),
('vsaracho@gigisplayhouse.org', 2, '2021-04-06');

-- --------------------------------------------------------

--
-- Estructura para la vista `califdatos`
--
DROP TABLE IF EXISTS `califdatos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `califdatos`  AS   (select `punt`.`login` AS `login`,`u`.`nombreUsuario` AS `nombreUsuario`,`u`.`apellidoPaterno` AS `apellidoPaterno`,`u`.`apellidoMaterno` AS `apellidoMaterno`,`part`.`sexo` AS `sexo`,timestampdiff(YEAR,`part`.`fechaNacimiento`,current_timestamp()) AS `Edad_Actual`,timestampdiff(YEAR,`part`.`fechaNacimiento`,`c`.`fechaFinal`) AS `Edad_Matriculacion`,`g`.`idGrupo` AS `idGrupo`,`g`.`idCiclo` AS `idCiclo`,`g`.`idPrograma` AS `idPrograma`,`p`.`puntajeMaximo` AS `puntajeMaximo`,`punt`.`idNivel` AS `idNivel`,avg(`punt`.`puntajeInicial`) AS `CalifInicial`,avg(`punt`.`puntajeFinal`) AS `CalifFinal`,(avg(`punt`.`puntajeFinal`) - avg(`punt`.`puntajeInicial`)) / (`p`.`puntajeMaximo` - 1) * 100 AS `Avance` from (((((`participantes_grupos_objetivo` `punt` join `grupos` `g`) join `programas` `p`) join `usuarios` `u`) join `participantes` `part`) join `ciclos` `c`) where `punt`.`idGrupo` = `g`.`idGrupo` and `g`.`idPrograma` = `p`.`idPrograma` and `u`.`login` = `punt`.`login` and `u`.`login` = `part`.`login` and `c`.`idCiclo` = `g`.`idCiclo` group by `punt`.`login`,`punt`.`idGrupo`,`punt`.`idNivel`)  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `grupos_programas_ciclos`
--
DROP TABLE IF EXISTS `grupos_programas_ciclos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `grupos_programas_ciclos`  AS   (select `p`.`nombrePrograma` AS `nombrePrograma`,`p`.`idPrograma` AS `idPrograma`,`g`.`idCiclo` AS `idCiclo`,`g`.`idGrupo` AS `idGrupo` from (`programas` `p` join `grupos` `g`) where `p`.`idPrograma` = `g`.`idPrograma` group by `g`.`idGrupo`)  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ciclos`
--
ALTER TABLE `ciclos`
  ADD PRIMARY KEY (`idCiclo`);

--
-- Indices de la tabla `funciones`
--
ALTER TABLE `funciones`
  ADD PRIMARY KEY (`idFuncion`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`idGrupo`),
  ADD KEY `cfgrupos_idprograma_programas` (`idPrograma`),
  ADD KEY `cfgrupos_idciclo_cicloss` (`idCiclo`);

--
-- Indices de la tabla `grupos_terapeutas`
--
ALTER TABLE `grupos_terapeutas`
  ADD PRIMARY KEY (`idGrupo`,`login`),
  ADD KEY `cfgrupos_terapeutas_login_terapeutas` (`login`);

--
-- Indices de la tabla `niveles`
--
ALTER TABLE `niveles`
  ADD PRIMARY KEY (`idNivel`),
  ADD KEY `cfniveles_idprograma_programas` (`idPrograma`);

--
-- Indices de la tabla `objetivos`
--
ALTER TABLE `objetivos`
  ADD PRIMARY KEY (`idObjetivo`),
  ADD KEY `cfobjetivos_idNivel_niveles` (`idNivel`);

--
-- Indices de la tabla `participantes`
--
ALTER TABLE `participantes`
  ADD PRIMARY KEY (`login`);

--
-- Indices de la tabla `participantes_grupos_objetivo`
--
ALTER TABLE `participantes_grupos_objetivo`
  ADD PRIMARY KEY (`login`,`idGrupo`,`idNivel`,`idObjetivo`),
  ADD KEY `cfpuntajes_idGrupo_grupos` (`idGrupo`),
  ADD KEY `cfpuntajes_idObjetivo_objetivos` (`idNivel`,`idObjetivo`);

--
-- Indices de la tabla `programas`
--
ALTER TABLE `programas`
  ADD PRIMARY KEY (`idPrograma`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`idRol`);

--
-- Indices de la tabla `roles_funciones`
--
ALTER TABLE `roles_funciones`
  ADD PRIMARY KEY (`idRol`,`idfuncion`),
  ADD KEY `cfroles_funciones_idFuncion_funciones` (`idfuncion`);

--
-- Indices de la tabla `terapeutas`
--
ALTER TABLE `terapeutas`
  ADD PRIMARY KEY (`login`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`login`);

--
-- Indices de la tabla `usuarios_roles`
--
ALTER TABLE `usuarios_roles`
  ADD PRIMARY KEY (`login`,`idRol`),
  ADD KEY `cfusuarios_roles_idRol_roles` (`idRol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ciclos`
--
ALTER TABLE `ciclos`
  MODIFY `idCiclo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `funciones`
--
ALTER TABLE `funciones`
  MODIFY `idFuncion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `idGrupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=342;

--
-- AUTO_INCREMENT de la tabla `niveles`
--
ALTER TABLE `niveles`
  MODIFY `idNivel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `objetivos`
--
ALTER TABLE `objetivos`
  MODIFY `idObjetivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `idPrograma` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `idRol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `cfgrupos_idciclo_cicloss` FOREIGN KEY (`idCiclo`) REFERENCES `ciclos` (`idCiclo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cfgrupos_idprograma_programas` FOREIGN KEY (`idPrograma`) REFERENCES `programas` (`idPrograma`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `grupos_terapeutas`
--
ALTER TABLE `grupos_terapeutas`
  ADD CONSTRAINT `cfgrupos_terapeutas_idGrupo_grupos` FOREIGN KEY (`idGrupo`) REFERENCES `grupos` (`idGrupo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cfgrupos_terapeutas_login_terapeutas` FOREIGN KEY (`login`) REFERENCES `terapeutas` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `niveles`
--
ALTER TABLE `niveles`
  ADD CONSTRAINT `cfniveles_idprograma_programas` FOREIGN KEY (`idPrograma`) REFERENCES `programas` (`idPrograma`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `objetivos`
--
ALTER TABLE `objetivos`
  ADD CONSTRAINT `cfobjetivos_idNivel_niveles` FOREIGN KEY (`idNivel`) REFERENCES `niveles` (`idNivel`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `participantes`
--
ALTER TABLE `participantes`
  ADD CONSTRAINT `cfparticipantes_login_usuarios` FOREIGN KEY (`login`) REFERENCES `usuarios` (`login`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `participantes_grupos_objetivo`
--
ALTER TABLE `participantes_grupos_objetivo`
  ADD CONSTRAINT `cfpuntajes_idGrupo_grupos` FOREIGN KEY (`idGrupo`) REFERENCES `grupos` (`idGrupo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cfpuntajes_idObjetivo_objetivos` FOREIGN KEY (`idNivel`,`idObjetivo`) REFERENCES `objetivos` (`idNivel`, `idObjetivo`),
  ADD CONSTRAINT `cfpuntajes_login_participantes` FOREIGN KEY (`login`) REFERENCES `participantes` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `roles_funciones`
--
ALTER TABLE `roles_funciones`
  ADD CONSTRAINT `cfroles_funciones_idFuncion_funciones` FOREIGN KEY (`idfuncion`) REFERENCES `funciones` (`idFuncion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cfroles_funciones_idRol_roles` FOREIGN KEY (`idRol`) REFERENCES `roles` (`idRol`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `terapeutas`
--
ALTER TABLE `terapeutas`
  ADD CONSTRAINT `cfterapeutas_login_usuarios` FOREIGN KEY (`login`) REFERENCES `usuarios` (`login`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios_roles`
--
ALTER TABLE `usuarios_roles`
  ADD CONSTRAINT `cfusuarios_roles_idRol_roles` FOREIGN KEY (`idRol`) REFERENCES `roles` (`idRol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cfusuarios_roles_login_usuarios` FOREIGN KEY (`login`) REFERENCES `usuarios` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
