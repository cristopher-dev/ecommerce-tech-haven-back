# Wompi Payment Backend

## Data Model Design

### Product

- id: string (UUID)
- name: string
- description: string
- price: number
- stock: number

### Customer

- id: string (UUID)
- name: string
- email: string
- address: string

### Transaction

- id: string (UUID)
- customerId: string
- productId: string
- amount: number
- status: PENDING | APPROVED | DECLINED
- createdAt: Date
- updatedAt: Date

### Delivery

- id: string (UUID)
- transactionId: string
- customerId: string
- status: PENDING | ASSIGNED | SHIPPED | DELIVERED
- createdAt: Date

## API Endpoints

- GET /products - List products
- GET /transactions - List transactions
- POST /transactions - Create transaction
- PUT /transactions/:id/process-payment - Process payment
- GET /customers - List customers
- GET /deliveries - List deliveries

## Swagger Documentation

Available at /api

## Test Coverage

Run `npm run test:cov` for coverage report.

## Deployment

Deployed on AWS (link to be added).

## Postman Collection

[Link to Postman Collection](https://example.com/collection)
