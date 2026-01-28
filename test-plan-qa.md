# QA Test Plan for Wompi Payment Backend

## Overview

This test plan outlines the QA checklist for reviewing the full functionality of the Wompi Payment Backend. The backend follows a hexagonal architecture with layers: Domain, Application (Use Cases), and Infrastructure (Controllers, Repositories, External Services). Testing covers unit tests, integration tests, end-to-end tests, and manual verification of key features.

## Objectives

- [ ] Ensure all business logic works correctly.
- [ ] Verify API endpoints respond as expected.
- [ ] Confirm database operations and seeding.
- [ ] Test external integrations (e.g., Wompi Payment Service).
- [ ] Validate error handling and edge cases.
- [ ] Achieve >80% test coverage.
- [ ] Validate API design, information architecture (DB schema, folder structure).
- [ ] Ensure safe handling of sensitive data (e.g., credit card info not stored).
- [ ] Confirm Railway Oriented Programming (ROP) in use cases.
- [ ] Verify cloud deployment (e.g., AWS).

## Test Environment

- **Framework**: NestJS with TypeScript.
- **Database**: PostgreSQL (via Docker Compose).
- **Testing Tools**: Jest for unit and e2e tests.
- **External Services**: Wompi sandbox for payments (keys: pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7, etc.).
- **Linting**: ESLint, Prettier.
- **Build**: npm run build, npm run test:cov.
- **ORM**: TypeORM or similar.
- **Serialization**: Class-transformer or similar.

## Checklist Categories

### 1. Setup and Configuration

- [ ] Verify Docker Compose setup for PostgreSQL.
- [ ] Run `npm install` and ensure no dependency issues.
- [ ] Execute `npm run build` successfully.
- [ ] Run `npm run lint` and fix any issues.
- [ ] Run `npm run format` and ensure code is formatted.
- [ ] Start the app with `npm run start:dev` and confirm it runs on the expected port.
- [ ] Verify database seeding on app start (products loaded from `products-seed.json`).

### 2. Unit Tests

- [ ] Run `npm run test` and ensure all unit tests pass.
- [ ] Check coverage report (`npm run test:cov`) for >80% coverage.
- [ ] Verify mocks for repositories and external services in tests.
- [ ] Test use cases: CreateTransactionUseCase, GetCustomersUseCase, etc.
- [ ] Test entities: Customer, Delivery, Product, Transaction (immutability, enums).
- [ ] Test repositories: In-memory and database implementations.
- [ ] Test external services: MockWompiPaymentService and WompiPaymentServiceImpl.

### 3. Integration Tests

- [ ] Run database integration tests for repositories.
- [ ] Test DI (Dependency Injection) in app.module.ts.
- [ ] Verify repository implementations (e.g., CustomerRepositoryImpl).
- [ ] Test database seeder functionality.

### 4. End-to-End (E2E) Tests

- [ ] Run `npm run test:e2e` and ensure all E2E tests pass.
- [ ] Test full API flows using Postman collection (`postman/Wompi Payment Backend.postman_collection.json`).
- [ ] Verify Swagger documentation for all endpoints.

### 5. API Endpoints Testing

#### Customers

- [ ] GET /customers: Returns list of customers.
- [ ] Verify response structure and data accuracy.

#### Deliveries

- [ ] GET /deliveries: Returns list of deliveries.
- [ ] Verify response structure and data accuracy.

#### Products

- [ ] GET /products: Returns list of products (seeded data).
- [ ] Verify response structure and data accuracy.
- [ ] Confirm no POST /products endpoint (products only seeded).

#### Transactions

- [ ] POST /transactions: Create a new transaction (pending status).
  - [ ] Validate input: customerId, productId, amount, delivery info.
  - [ ] Check stock availability before creation.
  - [ ] Handle real-life validations: valid customer, product exists, positive amount.
- [ ] GET /transactions: Returns list of transactions.
- [ ] POST /transactions/{id}/process: Process payment via Wompi.
  - [ ] Validate credit card data: number (MasterCard/VISA detection), expiration, CVV, fake but valid structure.
  - [ ] Test successful approval: Updates status to APPROVED, assigns delivery, updates stock.
  - [ ] Test rejection: Updates status to REJECTED.
  - [ ] Test error handling (e.g., invalid amount, network issues, card declined).
  - [ ] Ensure credit card data is not stored in DB (only tokenized via Wompi).
- [ ] Verify DTOs and validation (class-validator).
- [ ] Confirm different request types (GET, POST) for all entities.

### 6. Business Logic Validation

- [ ] ProcessPaymentUseCase: Orchestrates transaction creation, Wompi call, status update, delivery assignment, stock update.
- [ ] Error handling: Use Either<Error, T> from fp-ts, throw errors in controllers.
- [ ] Railway Oriented Programming (ROP) in use cases.
- [ ] Enums: TransactionStatus (PENDING, APPROVED, REJECTED).
- [ ] Business logic NOT in controllers; separated in use cases.

### 6.1 Architecture and Design Validation

- [ ] Hexagonal Architecture: Domain, Application, Infrastructure layers.
- [ ] Ports & Adapters pattern: Repositories as ports, implementations as adapters.
- [ ] Folder structure: Matches hexagonal (domain/, application/, infrastructure/).
- [ ] DB schema design: Documented in README.md (entities, relationships).
- [ ] ORM usage: TypeORM or similar for database interactions.
- [ ] Serialization: Proper DTOs for requests/responses.

### 7. External Integrations

- [ ] Wompi Payment Service: Test sandbox integration.
  - [ ] Mock service for unit tests.
  - [ ] Real service for E2E (use sandbox keys from .env).
- [ ] Axios for HTTP calls to Wompi.

### 8. Database and Persistence

- [ ] Verify PostgreSQL entities match domain entities.
- [ ] Test CRUD operations via repositories.
- [ ] Check foreign keys and relationships (e.g., Transaction -> Customer, Product).
- [ ] Seeder: Loads products on startup.

### 9. Security and Validation

- [ ] Input validation via DTOs.
- [ ] No sensitive data exposure in responses.
- [ ] Environment variables for secrets (.env file).
- [ ] CORS and other security headers (if applicable).
- [ ] Safe handling of sensitive data: Credit card info not stored, only processed via Wompi.
- [ ] OWASP alignments, HTTPS, security headers (bonus).

### 10. Performance and Edge Cases

- [ ] Test with large datasets (e.g., many transactions).
- [ ] Concurrent requests handling.
- [ ] Invalid inputs (e.g., negative amounts, non-existent IDs).
- [ ] Network failures in external calls.
- [ ] Database connection issues.

### 11. Documentation and Maintenance

- [ ] Verify README.md for setup instructions.
- [ ] Check TODO.md for pending tasks.
- [ ] Swagger: All endpoints documented with @ApiTags, @ApiOperation.
- [ ] Postman collection public URL in README.md.
- [ ] DB model design in README.md.
- [ ] Unit test results in README.md.
- [ ] Commit messages: Functional changes, descriptive.

### 12. Deployment and CI/CD

- [ ] Build passes in CI (if applicable).
- [ ] Docker container runs correctly.
- [ ] Environment-specific configs (dev, prod).
- [ ] Cloud deployment (AWS recommended: Lambda, ECS, etc.).
- [ ] App deployed and working with backend API.

## Test Execution Steps

- [ ] Set up environment: Clone repo, run Docker Compose, npm install.
- [ ] Run unit tests: `npm run test:cov`.
- [ ] Run E2E tests: `npm run test:e2e`.
- [ ] Manual API testing: Use Postman collection.
- [ ] Review coverage and fix gaps.
- [ ] Document any bugs or issues found.

## Sign-Off Criteria

- [ ] All tests pass.
- [ ] Coverage >80%.
- [ ] No critical bugs.
- [ ] Manual review confirms functionality.
- [ ] API design and validations meet real-life scenarios.
- [ ] Sensitive data handled securely.
- [ ] Architecture follows Hexagonal and ROP.
- [ ] Documentation complete (README, Postman/Swagger).
- [ ] Cloud deployment functional.

## Notes

- Update this plan as new features are added.
- Reference copilot-instructions.md for architecture details.
- Ensure backend supports the 5-step business process: Product page -> Credit Card/Delivery -> Summary -> Payment -> Result -> Updated Product page.
- Validate Wompi sandbox integration with provided keys.
- No real money transactions; all in sandbox mode.
