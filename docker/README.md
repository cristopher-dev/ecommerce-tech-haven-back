# Configuración de Docker

Esta carpeta contiene la configuración de Docker para el proyecto Wompi Backend.

## Tabla de Contenidos

- [Servicios](#servicios)
- [Cómo usar](#cómo-usar)
- [Configuración](#configuración)

## Servicios

- **PostgreSQL**: Base de datos usando imagen Alpine

## Cómo usar

1. Navega a la carpeta docker:

   ```bash
   cd docker
   ```

2. Inicia los servicios:

   ```bash
   docker-compose up -d
   ```

3. Verifica que PostgreSQL esté ejecutándose:

   ```bash
   docker-compose ps
   ```

4. Para detener:

   ```bash
   docker-compose down
   ```

## Configuración

- Puerto: 5432
- Base de datos: wompi_db
- Usuario: wompi_user
- Contraseña: wompi_password

La base de datos se persiste en un volumen de Docker llamado `postgres_data`.
