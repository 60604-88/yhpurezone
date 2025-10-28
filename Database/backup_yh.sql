-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: yhpurezone_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `yhpurezone_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `yhpurezone_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `yhpurezone_db`;

--
-- Table structure for table `bloqueos_disponibilidad`
--

DROP TABLE IF EXISTS `bloqueos_disponibilidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bloqueos_disponibilidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloqueos_disponibilidad`
--

LOCK TABLES `bloqueos_disponibilidad` WRITE;
/*!40000 ALTER TABLE `bloqueos_disponibilidad` DISABLE KEYS */;
/*!40000 ALTER TABLE `bloqueos_disponibilidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `direccion_id` int NOT NULL,
  `fecha_hora_cita` datetime NOT NULL,
  `precio_total` decimal(10,2) NOT NULL,
  `estado` enum('confirmada','completada','cancelada') NOT NULL DEFAULT 'confirmada',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `direccion_id` (`direccion_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,5,5,'2025-10-25 13:00:00',40000.00,'completada','2025-10-25 01:05:14'),(2,5,5,'2025-10-25 13:00:00',75000.00,'completada','2025-10-25 02:44:47');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas_servicios`
--

DROP TABLE IF EXISTS `citas_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas_servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cita_id` int NOT NULL,
  `opcion_variacion_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_reserva` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  KEY `fk_citas_variaciones` (`opcion_variacion_id`),
  CONSTRAINT `citas_servicios_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_variaciones` FOREIGN KEY (`opcion_variacion_id`) REFERENCES `opcion_variaciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas_servicios`
--

LOCK TABLES `citas_servicios` WRITE;
/*!40000 ALTER TABLE `citas_servicios` DISABLE KEYS */;
INSERT INTO `citas_servicios` VALUES (1,1,1,1,40000.00),(2,2,14,1,50000.00),(3,2,21,1,25000.00);
/*!40000 ALTER TABLE `citas_servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `direccion_calle` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `detalles` text,
  `es_predeterminada` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,2,'Avenida Siempre Viva 742','Cali',NULL,1),(3,2,'Oficina Principal, Torre Alfa','Cali',NULL,0),(4,2,'Carrera 5 # 6 - 78','Cali','Apto 301, Edificio El Roble',0),(5,5,'Calle 41 # 42 - 18','Palmira','Casa enrejada',0);
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opcion_variaciones`
--

DROP TABLE IF EXISTS `opcion_variaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opcion_variaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `opcion_id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `opcion_id` (`opcion_id`),
  CONSTRAINT `opcion_variaciones_ibfk_1` FOREIGN KEY (`opcion_id`) REFERENCES `servicio_opciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opcion_variaciones`
--

LOCK TABLES `opcion_variaciones` WRITE;
/*!40000 ALTER TABLE `opcion_variaciones` DISABLE KEYS */;
INSERT INTO `opcion_variaciones` VALUES (1,1,'Automóvil',40000.00),(2,1,'Camioneta',50000.00),(3,2,'Automóvil',200000.00),(4,2,'Camioneta',300000.00),(5,3,'Automóvil',120000.00),(6,3,'Camioneta',140000.00),(7,4,'2 Muebles Pequeños + 1 Grande',100000.00),(8,4,'Isabelinas',135000.00),(9,4,'1 Grande y 2 Pequeños (Mediano)',140000.00),(10,5,'4 Sillas',0.00),(11,5,'6 Sillas',10000.00),(12,6,'Sentadero y Espaldar',50000.00),(13,6,'Solo Sentadero',40000.00),(14,7,'Grande',50000.00),(15,7,'Pequeña',40000.00),(16,8,'Sencillo (100x100)',80000.00),(17,8,'Semi-doble (120x90)',90000.00),(18,8,'Doble (140x90)',110000.00),(19,8,'Queen (160x120)',120000.00),(20,8,'King (200x200)',150000.00),(21,9,'Cuero',25000.00);
/*!40000 ALTER TABLE `opcion_variaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reseñas`
--

DROP TABLE IF EXISTS `reseñas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reseñas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cita_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `calificacion` int NOT NULL,
  `comentario` text,
  `esta_aprobada` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cita_id` (`cita_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reseñas`
--

LOCK TABLES `reseñas` WRITE;
/*!40000 ALTER TABLE `reseñas` DISABLE KEYS */;
INSERT INTO `reseñas` VALUES (1,1,5,4,'dr',0,'2025-10-25 02:07:13'),(2,2,5,4,'Epa Epa',0,'2025-10-25 02:46:30');
/*!40000 ALTER TABLE `reseñas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio_opciones`
--

DROP TABLE IF EXISTS `servicio_opciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio_opciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `servicio_id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `servicio_opciones_ibfk_1` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio_opciones`
--

LOCK TABLES `servicio_opciones` WRITE;
/*!40000 ALTER TABLE `servicio_opciones` DISABLE KEYS */;
INSERT INTO `servicio_opciones` VALUES (1,1,'Tipo de Vehículo'),(2,2,'Tipo de Vehículo'),(3,3,'Tipo de Vehículo'),(4,4,'Composición de la Sala'),(5,5,'Número de Sillas'),(6,5,'Tipo de Limpieza'),(7,6,'Tamaño'),(8,7,'Tamaño del Colchón'),(9,6,'Material');
/*!40000 ALTER TABLE `servicio_opciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `categoria` enum('Vehículos','Muebles','Colchones') NOT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Lavado Básico de Vehículo','Incluye lavado por fuera, limpieza interior y aspirada de plantilla.','Vehículos',1),(2,'Lavado Completo Desmantelado','Incluye lavado de interior y exterior a fondo con desmantelado de piezas.','Vehículos',1),(3,'Lavado Solo Interior','Limpieza profunda de panel de control, carteras, techo, cojinería y más.','Vehículos',1),(4,'Limpieza de Juego de Sala','Limpieza y desinfección profunda para juegos de sala de diferentes tamaños.','Muebles',1),(5,'Limpieza de Sillas de Comedor','Limpieza de sentadero y/o espaldar para sillas de comedor.','Muebles',1),(6,'Limpieza de Silla de Escritorio','Limpieza para sillas de oficina de diferentes tamaños.','Muebles',1),(7,'Desinfección de Colchón','Eliminación profunda de ácaros y bacterias para colchones de todas las medidas.','Colchones',1);
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `contraseña_hash` varchar(255) NOT NULL,
  `rol` enum('cliente','admin') NOT NULL DEFAULT 'cliente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador Principal','admin@yhpurezone.com','0000000000','$2b$10$nxAyl4YM08/EstXlPu7RGO64v1dtqFLDfmErvCBb6teOQi5vqPLee','admin','2025-09-30 04:04:52'),(2,'Ana Lucía García Rojas','ana.garcia@email.com','3117654321','$2b$10$vNJkOz/BWsBJszCi1uruP.U..yjofa7OgO.OLZVBp6VCEoyLYbUm6','cliente','2025-09-30 04:05:30'),(4,'Johan Stiven Jojoa ','stven.jojoa@gmail.com','3100563377','$2b$10$CM902ExIDxPi6SdKN5WwUOux67W015y2ywrfZLiMl8bcUI45Pc5Se','cliente','2025-10-01 20:32:50'),(5,'Juan David Gamba','jDgamba@gmail.com','3100553388','$2b$10$3Oa.2PPYRXaebyRHElnXXOurs6Ke9BkZ2WlPqYdd0JijKeJkauNlG','cliente','2025-10-03 03:45:21'),(6,'Brian Andres','bag2@gmail.com','3002563232','$2b$10$2KS/cL1g5aF1qStPlfuIHeiAjAncy.C60FO1Bnm1Zc5O3Ur2Ves9e','cliente','2025-10-04 02:32:05');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-27 21:10:33
