CREATE DATABASE IF NOT EXISTS SistemaDeVotacion;

USE SistemaDeVotacion;

CREATE TABLE IF NOT EXISTS Proyectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  localidad VARCHAR(100),
  presupuesto DECIMAL(10, 2),
  fecha_inicio DATE,
  fecha_fin DATE
);
