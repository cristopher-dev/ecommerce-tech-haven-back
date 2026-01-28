# Docker Setup

This folder contains the Docker configuration for the Wompi Backend project.

## Services

- **PostgreSQL**: Database using Alpine image

## How to use

1. Navigate to the docker folder:

   ```bash
   cd docker
   ```

2. Start the services:

   ```bash
   docker-compose up -d
   ```

3. Verify that PostgreSQL is running:

   ```bash
   docker-compose ps
   ```

4. To stop:

   ```bash
   docker-compose down
   ```

## Configuration

- Port: 5432
- Database: wompi_db
- User: wompi_user
- Password: wompi_password

The database is persisted in a Docker volume called `postgres_data`.
