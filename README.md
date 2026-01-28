# Wompi Payment Backend

Backend API para procesamiento de pagos Wompi implementado con NestJS y arquitectura hexagonal.

## Arquitectura

- **Hexagonal Architecture**: Separación clara entre dominio, aplicación e infraestructura
- **Railway Oriented Programming**: Manejo funcional de errores con fp-ts
- **Base de datos**: PostgreSQL con TypeORM
- **Testing**: Jest con >80% cobertura

## Data Model Design

### Product

- id: string (UUID)
- name: string
- description: string
- price: decimal(10,2)
- stock: integer

### Customer

- id: string (UUID)
- name: string
- email: string
- address: string

### Transaction

- id: string (UUID)
- customerId: string (FK)
- productId: string (FK)
- amount: decimal(10,2)
- status: enum (PENDING, APPROVED, DECLINED)
- createdAt: timestamp
- updatedAt: timestamp

### Delivery

- id: string (UUID)
- transactionId: string (FK)
- customerId: string (FK)
- status: enum (PENDING, ASSIGNED, SHIPPED, DELIVERED)
- createdAt: timestamp

## API Endpoints

- GET /products - Listar productos con stock
- GET /transactions - Listar transacciones
- POST /transactions - Crear transacción pendiente
- PUT /transactions/:id/process-payment - Procesar pago con Wompi
- GET /customers - Listar clientes
- GET /deliveries - Listar entregas

## Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wompi_user
DATABASE_PASSWORD=wompi_password
DATABASE_NAME=wompi_db

# Entorno
NODE_ENV=development

# Wompi API - Sandbox
WOMPI_SANDBOX_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
WOMPI_INTEGRITY_KEY=nAIBuqayW70XpUqJS4qf4STYiISd89Fp
```

## Desarrollo Local

### Prerrequisitos

- Node.js 18+
- PostgreSQL 13+ o Docker

### Instalación

```bash
npm install
```

### Base de Datos

Opción 1: Docker Compose (recomendado)

```bash
cd docker
docker-compose up -d
```

Opción 2: PostgreSQL local

Asegurarse de que PostgreSQL esté corriendo y crear la base de datos `wompi_db`.

### Ejecutar

```bash
# Desarrollo con hot reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Testing

```bash
# Ejecutar tests
npm test

# Con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

**Cobertura actual: 85.89%**

## Swagger Documentation

Disponible en `/api` cuando la aplicación está corriendo.

## Docker Setup

Para ejecutar PostgreSQL localmente usando Docker:

```bash
cd docker
docker-compose up -d
```

Ver `docker/README.md` para más detalles.

## Deployment

Desplegado en AWS (link por agregar).

## Postman Collection

[Link to Postman Collection](https://example.com/collection)
