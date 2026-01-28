# Docker Setup

Esta carpeta contiene la configuración de Docker para el proyecto Wompi Backend.

## Servicios

- **PostgreSQL**: Base de datos usando imagen Alpine

## Cómo usar

1. Navegar a la carpeta docker:

   ```bash
   cd docker
   ```

2. Levantar los servicios:

   ```bash
   docker-compose up -d
   ```

3. Verificar que PostgreSQL esté corriendo:

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

La base de datos se persiste en un volumen Docker llamado `postgres_data`.
