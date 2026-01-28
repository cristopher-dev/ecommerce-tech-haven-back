# QA Test Plan for Wompi Payment Backend

## Overview

This test plan outlines the QA checklist for reviewing the full functionality of the Wompi Payment Backend. The backend follows a hexagonal architecture with layers: Domain, Application (Use Cases), and Infrastructure (Controllers, Repositories, External Services). Testing covers unit tests, integration tests, end-to-end tests, and manual verification of key features.

## Objectives

- [x] Ensure all business logic works correctly.
- [x] Verify API endpoints respond as expected.
- [x] Confirm database operations and seeding.
- [x] Test external integrations (e.g., Wompi Payment Service).
- [x] Validate error handling and edge cases.
- [x] Achieve >80% test coverage.
- [x] Validate API design, information architecture (DB schema, folder structure).
- [x] Ensure safe handling of sensitive data (e.g., credit card info not stored).
- [x] Confirm Railway Oriented Programming (ROP) in use cases.
- [x] Verify cloud deployment (e.g., AWS).

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

- [x] Verify Docker Compose setup for PostgreSQL.
- [x] Run `npm install` and ensure no dependency issues.
- [x] Execute `npm run build` successfully.
- [x] Run `npm run lint` and fix any issues.
- [x] Run `npm run format` and ensure code is formatted.
- [x] Start the app with `npm run start:dev` and confirm it runs on the expected port.
- [x] Verify database seeding on app start (products loaded from `products-seed.json`).

### 2. Unit Tests

- [x] Run `npm run test` and ensure all unit tests pass.
- [x] Check coverage report (`npm run test:cov`) for >80% coverage.
- [x] Verify mocks for repositories and external services in tests.
- [x] Test use cases: CreateTransactionUseCase, GetCustomersUseCase, etc.
- [x] Test entities: Customer, Delivery, Product, Transaction (immutability, enums).
- [x] Test repositories: In-memory and database implementations.
- [x] Test external services: MockWompiPaymentService and WompiPaymentServiceImpl.

### 3. Integration Tests

- [x] Run database integration tests for repositories.
- [x] Test DI (Dependency Injection) in app.module.ts.
- [x] Verify repository implementations (e.g., CustomerRepositoryImpl).
- [x] Test database seeder functionality.

### 4. End-to-End (E2E) Tests

- [x] Run `npm run test:e2e` and ensure all E2E tests pass.
- [x] Test full API flows using Postman collection (`postman/Wompi Payment Backend.postman_collection.json`).
- [x] Verify Swagger documentation for all endpoints.

### 5. API Endpoints Testing

#### Customers

- [x] GET /customers: Returns list of customers.
- [x] Verify response structure and data accuracy.

#### Deliveries

- [x] GET /deliveries: Returns list of deliveries.
- [x] Verify response structure and data accuracy.

#### Products

- [x] GET /products: Returns list of products (seeded data).
- [x] Verify response structure and data accuracy.
- [x] Confirm no POST /products endpoint (products only seeded).

#### Transactions

- [x] POST /transactions: Create a new transaction (pending status).
  - [x] Validate input: customerId, productId, amount, delivery info.
  - [x] Check stock availability before creation.
  - [x] Handle real-life validations: valid customer, product exists, positive amount.
- [x] GET /transactions: Returns list of transactions.
- [x] POST /transactions/{id}/process: Process payment via Wompi.
  - [x] Validate credit card data: number (MasterCard/VISA detection), expiration, CVV, fake but valid structure.
  - [x] Test successful approval: Updates status to APPROVED, assigns delivery, updates stock.
  - [x] Test rejection: Updates status to REJECTED.
  - [x] Test error handling (e.g., invalid amount, network issues, card declined).
  - [x] Ensure credit card data is not stored in DB (only tokenized via Wompi).
- [x] Verify DTOs and validation (class-validator).
- [x] Confirm different request types (GET, POST) for all entities.

### 6. Business Logic Validation

- [x] ProcessPaymentUseCase: Orchestrates transaction creation, Wompi call, status update, delivery assignment, stock update.
- [x] Error handling: Use Either<Error, T> from fp-ts, throw errors in controllers.
- [x] Railway Oriented Programming (ROP) in use cases.
- [x] Enums: TransactionStatus (PENDING, APPROVED, REJECTED).
- [x] Business logic NOT in controllers; separated in use cases.

### 6.1 Architecture and Design Validation

- [x] Hexagonal Architecture: Domain, Application, Infrastructure layers.
- [x] Ports & Adapters pattern: Repositories as ports, implementations as adapters.
- [x] Folder structure: Matches hexagonal (domain/, application/, infrastructure/).
- [x] DB schema design: Documented in README.md (entities, relationships).
- [x] ORM usage: TypeORM or similar for database interactions.
- [x] Serialization: Proper DTOs for requests/responses.

### 7. External Integrations

- [x] Wompi Payment Service: Test sandbox integration.
  - [x] Mock service for unit tests.
  - [x] Real service for E2E (use sandbox keys from .env).
- [x] Axios for HTTP calls to Wompi.

### 8. Database and Persistence

- [x] Verify PostgreSQL entities match domain entities.
- [x] Test CRUD operations via repositories.
- [x] Check foreign keys and relationships (e.g., Transaction -> Customer, Product).
- [x] Seeder: Loads products on startup.

### 9. Security and Validation

- [x] Input validation via DTOs.
- [x] No sensitive data exposure in responses.
- [x] Environment variables for secrets (.env file).
- [x] CORS and other security headers (if applicable).
- [x] Safe handling of sensitive data: Credit card info not stored, only processed via Wompi.
- [x] OWASP alignments, HTTPS, security headers (bonus).

### 10. Performance and Edge Cases

- [x] Test with large datasets (e.g., many transactions).
- [x] Concurrent requests handling.
- [x] Invalid inputs (e.g., negative amounts, non-existent IDs).
- [x] Network failures in external calls.
- [x] Database connection issues.

### 11. Documentation and Maintenance

- [x] Verify README.md for setup instructions.
- [x] Check TODO.md for pending tasks.
- [x] Swagger: All endpoints documented with @ApiTags, @ApiOperation.
- [x] Postman collection public URL in README.md.
- [x] DB model design in README.md.
- [x] Unit test results in README.md.
- [x] Commit messages: Functional changes, descriptive.

### 12. Deployment and CI/CD

- [x] Build passes in CI (if applicable).
- [x] Docker container runs correctly.
- [ ] Environment-specific configs (dev, prod).
- [ ] Cloud deployment (AWS recommended: Lambda, ECS, etc.).
- [x] App deployed and working with backend API.

## Test Execution Steps

- [x] Set up environment: Clone repo, run Docker Compose, npm install.
- [x] Run unit tests: `npm run test:cov`.
- [x] Run E2E tests: `npm run test:e2e`.
- [x] Manual API testing: Use Postman collection.
- [x] Review coverage and fix gaps.
- [x] Document any bugs or issues found.

## Sign-Off Criteria

- [x] All tests pass.
- [x] Coverage >80%.
- [x] No critical bugs.
- [x] Manual review confirms functionality.
- [x] API design and validations meet real-life scenarios.
- [x] Sensitive data handled securely.
- [x] Architecture follows Hexagonal and ROP.
- [x] Documentation complete (README, Postman/Swagger).
- [x] Cloud deployment functional.

## Notes

- Update this plan as new features are added.
- Reference copilot-instructions.md for architecture details.
- Ensure backend supports the 5-step business process: Product page -> Credit Card/Delivery -> Summary -> Payment -> Result -> Updated Product page.
- Validate Wompi sandbox integration with provided keys.
- No real money transactions; all in sandbox mode.
