# TechHaven Backend - Docker Setup

## Quick Start with Docker Compose

### Prerequisites

- Docker (>= 20.10)
- Docker Compose (>= 1.29)
- Git

### Starting the Stack

1. **Navigate to the docker directory:**

```bash
cd docker
```

1. **Start all services:**

```bash
docker-compose up -d
```

This will start:

- **PostgreSQL 15** on `localhost:5432`
- **pgAdmin 4** on `http://localhost:5050`
- **NestJS App** on `http://localhost:3000`

### Verify Services Are Running

```bash
docker-compose ps
```

Expected output:

```
NAME                    STATUS
tech-haven-postgres     Up (healthy)
tech-haven-pgadmin      Up
tech-haven-app          Up
```

### Access Services

#### PostgreSQL Database

- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** `password`
- **Database:** `tech-haven_db`

#### pgAdmin Dashboard

- **URL:** `http://localhost:5050`
- **Email:** `admin@tech-haven.com`
- **Password:** `admin`

#### API Documentation (Swagger)

- **URL:** `http://localhost:3000/api/docs`

#### API Endpoints

```
GET    http://localhost:3000/products
GET    http://localhost:3000/products/:id
GET    http://localhost:3000/customers
POST   http://localhost:3000/customers
GET    http://localhost:3000/customers/:id
GET    http://localhost:3000/transactions
POST   http://localhost:3000/transactions
GET    http://localhost:3000/transactions/:id
PUT    http://localhost:3000/transactions/:id/process-payment
GET    http://localhost:3000/deliveries
GET    http://localhost:3000/deliveries/:id
```

## Environment Configuration

### Development Environment

The `.env` file in the project root controls application settings:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=tech-haven_db
DATABASE_LOGGING=false

# Payment Service
PAYMENT_SERVICE_TYPE=mock  # Use 'mock' for development

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
```

### Docker Compose Variables

The `docker-compose.yml` automatically uses variables from the root `.env` file:

```env
DATABASE_HOST=postgres          # Use 'postgres' service name inside Docker
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=tech-haven_db
APP_PORT=3000
```

## Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Stop Services

```bash
# Stop without removing
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Restart Services

```bash
docker-compose restart app
docker-compose restart postgres
```

### Rebuild Image

```bash
docker-compose build --no-cache
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 5432
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check database container logs
docker-compose logs postgres

# Connect to database manually
docker-compose exec postgres psql -U postgres -d tech-haven_db
```

### Rebuild and Restart Everything

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Development Workflow

### Watch Mode with Hot Reload

The app container runs with `npm run start:dev` which enables hot reload. Any changes to `src/` files will trigger a rebuild.

### Run Tests Inside Container

```bash
docker-compose exec app npm run test
docker-compose exec app npm run test:cov
docker-compose exec app npm run test:e2e
```

### Build Distribution

```bash
docker-compose exec app npm run build
```

### Run Linter

```bash
docker-compose exec app npm run lint
```

## Production Deployment

For production, use a multi-stage Dockerfile with optimizations:

1. **Build image without node_modules mounted:**

```bash
docker build -t tech-haven-api:latest .
```

1. **Run with environment variables:**

```bash
docker run -d \
  --name tech-haven-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_HOST=<db-host> \
  -e DATABASE_USER=<db-user> \
  -e DATABASE_PASSWORD=<db-password> \
  -e DATABASE_NAME=<db-name> \
  tech-haven-api:latest
```

## Health Checks

Both the database and application containers include health checks:

```bash
# Check database health
docker-compose exec postgres pg_isready -U postgres

# Check app health (should return OK)
curl http://localhost:3000/api/health
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Alpine Documentation](https://hub.docker.com/_/node)
