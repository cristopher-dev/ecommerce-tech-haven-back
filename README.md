# Wompi Payment Backend

Backend API for Wompi payment processing implemented with NestJS and hexagonal architecture.

## Architecture

- **Hexagonal Architecture**: Clear separation between domain, application, and infrastructure
- **Railway Oriented Programming**: Functional error handling with fp-ts
- **Database**: PostgreSQL with TypeORM
- **Testing**: Jest with >80% coverage

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

- GET /products - List products with stock
- GET /transactions - List transactions
- POST /transactions - Create pending transaction
- PUT /transactions/:id/process-payment - Process payment with Wompi
- GET /customers - List customers
- GET /deliveries - List deliveries

## Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wompi_user
DATABASE_PASSWORD=wompi_password
DATABASE_NAME=wompi_db

# Environment
NODE_ENV=development

# Wompi API - Sandbox
WOMPI_SANDBOX_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
WOMPI_INTEGRITY_KEY=nAIBuqayW70XpUqJS4qf4STYiISd89Fp
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 13+ or Docker

### Installation

```bash
npm install
```

### Database

Option 1: Docker Compose (recommended)

```bash
cd docker
docker-compose up -d
```

Option 2: Local PostgreSQL

Make sure PostgreSQL is running and create the `wompi_db` database.

### Run

```bash
# Development with hot reload
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Testing

```bash
# Run tests
npm test

# With coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

**Current coverage: 85.89%**

## Swagger Documentation

API documentation is available via Swagger UI at `/api` when the application is running.

- **URL**: `http://localhost:3000/api` (local development)
- **Features**: Interactive API documentation with request/response examples, schema definitions, and testing capabilities

## Docker Setup

To run PostgreSQL locally using Docker:

```bash
cd docker
docker-compose up -d
```

See `docker/README.md` for more details.

## Deployment

Deployed on AWS (link to be added).

## Postman Collection

Import the Postman collection from the file: [`Wompi Payment Backend.postman_collection.json`](./Wompi%20Payment%20Backend.postman_collection.json)

This collection includes all API endpoints with example requests and variables for easy testing.
