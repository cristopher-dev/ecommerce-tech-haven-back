# TechHaven Backend - Lista de Tareas

## Requisitos Funcionales del Negocio

### 1. Gestión de Productos

- [ ] Endpoint GET `/products` - Listar todos los productos con stock disponible
- [ ] Endpoint GET `/products/:id` - Obtener detalles de un producto específico
- [ ] Validar que el producto exista antes de procesar transacción
- [ ] Validar disponibilidad de stock (cantidad solicitada <= stock disponible)
- [ ] Base de datos seeded con productos dummy (JSON)
- [ ] Descripción y precio de cada producto

### 2. Gestión de Clientes

- [ ] Endpoint POST `/customers` - Crear nuevo cliente con validación de email único
- [ ] Endpoint GET `/customers` - Listar todos los clientes
- [ ] Endpoint GET `/customers/:id` - Obtener detalles de cliente
- [ ] Deduplicación de clientes por email (validar si ya existe antes de crear)
- [ ] Almacenar datos de cliente de forma segura (no exponer datos sensibles innecesariamente)
- [ ] Validación de formato de email

### 3. Gestión de Transacciones

- [ ] Endpoint POST `/transactions` - Crear transacción en estado PENDING
  - [ ] Input: producto, cantidad, datos cliente, datos de envío
  - [ ] Output: número de transacción único
  - [ ] Validar stock disponible
  - [ ] Validar datos de cliente requeridos
  - [ ] Validar datos de envío requeridos
- [ ] Endpoint GET `/transactions` - Listar todas las transacciones
- [ ] Endpoint GET `/transactions/:id` - Obtener detalles de transacción
- [ ] Endpoint PATCH `/transactions/:id` - Actualizar estado de transacción tras pago
- [ ] Estados de transacción: PENDING → APPROVED/DECLINED → COMPLETED/FAILED
- [ ] Generar número de transacción único y rastreable

### 4. Gestión de Entregas

- [ ] Endpoint POST `/deliveries` - Crear registro de entrega tras pago exitoso
- [ ] Endpoint GET `/deliveries` - Listar todas las entregas
- [ ] Endpoint GET `/deliveries/:id` - Obtener detalles de entrega
- [ ] Auto-crear registro de entrega solo después de pago exitoso
- [ ] Asociar entrega con transacción y cliente
- [ ] Almacenar dirección de entrega de forma segura

### 5. Flujo de Pago (Integración Wompi)

- [ ] Implementar ProcessPaymentUseCase
- [ ] Integración con API Wompi (Sandbox)
- [ ] Validar respuesta de Wompi
- [ ] Actualizar estado de transacción con resultado de pago
- [ ] Crear registro de Delivery en caso de pago exitoso
- [ ] Actualizar stock tras pago exitoso
- [ ] Manejo robusto de errores de pago

---

## Requisitos de Arquitectura y Código

### 6. Arquitectura Hexagonal (Ports & Adapters)

- [ ] **Domain Layer** (`src/domain/`)
  - [ ] Entidades de negocio: Customer, Product, Transaction, Delivery
  - [ ] Interfaces de repositorios (puertos): CustomerRepository, ProductRepository, TransactionRepository, DeliveryRepository
  - [ ] Constantes y enums de dominio
  - [ ] NO dependencias externas
- [ ] **Application Layer** (`src/application/use-cases/`)
  - [ ] CreateTransactionUseCase
  - [ ] ProcessPaymentUseCase
  - [ ] GetProductsUseCase
  - [ ] GetCustomersUseCase
  - [ ] GetTransactionsUseCase
  - [ ] GetDeliveriesUseCase
  - [ ] Railway Oriented Programming (ROP) con fp-ts Either/TaskEither
  - [ ] Cada use case retorna `Either<Error, Entity>`
- [ ] **Infrastructure Layer** (`src/infrastructure/`)
  - [ ] Controllers HTTP (adaptadores)
  - [ ] Implementaciones de repositorios (PostgreSQL + TypeORM)
  - [ ] Servicios externos (Wompi Payment Service)
  - [ ] DTOs con validaciones (class-validator)

### 7. Railway Oriented Programming (ROP)

- [ ] Usar fp-ts library para Either/TaskEither pattern
- [ ] Use cases retornan `Either<Error, Entity>` en lugar de promises
- [ ] Controllers validan `result._tag === 'Left'` para detectar errores (NO try-catch)
- [ ] Encadenamiento de operaciones con map, chain, fold
- [ ] Manejo de errores consistente sin excepciones

### 8. Inyección de Dependencias (NestJS)

- [ ] Custom providers en AppModule/DatabaseModule
- [ ] Inyección de repositorios mediante string tokens: `@Inject('RepositoryName')`
- [ ] Resolver todas las dependencias a través del IoC container
- [ ] Módulos bien organizados: AppModule, DatabaseModule, etc.

### 9. Base de Datos (PostgreSQL + TypeORM)

- [ ] Configuración de conexión PostgreSQL
- [ ] Entidades TypeORM en `src/infrastructure/database/entities/`
  - [ ] CustomerEntity
  - [ ] ProductEntity
  - [ ] TransactionEntity
  - [ ] DeliveryEntity
- [ ] Migraciones o sincronización de esquema
- [ ] Seeding de productos dummy en DatabaseSeeder
- [ ] Índices en campos de búsqueda (email, transactionId, etc.)
- [ ] Variables de entorno para credenciales

### 10. DTOs y Validaciones

- [ ] DTOs en `src/infrastructure/controllers/dto.ts`
- [ ] Validadores con class-validator:
  - [ ] Email válido
  - [ ] Número de tarjeta válido (formato)
  - [ ] Cantidad de producto >= 1
  - [ ] Campos requeridos no vacíos
  - [ ] Rango de valores (precios, cantidades)
- [ ] Custom validators para reglas de negocio
- [ ] Mensajes de error descriptivos

### 11. Swagger/OpenAPI

- [ ] Documentación automática de endpoints
- [ ] Decoradores `@ApiTags`, `@ApiOperation`, `@ApiResponse` en controllers
- [ ] Esquemas de DTOs en Swagger
- [ ] URL pública de Swagger en README.md

---

## Requisitos de Seguridad

### 12. OWASP y Seguridad (BONUS)

- [ ] HTTPS en producción
- [ ] Security headers (CORS, CSP, X-Frame-Options, etc.)
- [ ] Validación de entrada en todos los endpoints
- [ ] Sanitización de datos
- [ ] NO exponer stack traces en errores de producción
- [ ] Encriptación de datos sensibles (si aplica)
- [ ] Rate limiting para endpoints sensibles

### 13. Manejo de Datos Sensibles

- [ ] NO loguear números de tarjeta o tokens
- [ ] NO almacenar CVV de tarjeta
- [ ] Acceso limitado a datos de pago
- [ ] Validación de autorización antes de acceder a datos

---

## Requisitos de Testing

### 14. Unit Tests (>80% Coverage)

- [ ] Tests para cada Use Case en `tests/application/use-cases/`
  - [ ] CreateTransactionUseCase.spec.ts
  - [ ] ProcessPaymentUseCase.spec.ts
  - [ ] GetProductsUseCase.spec.ts
  - [ ] GetCustomersUseCase.spec.ts
  - [ ] GetTransactionsUseCase.spec.ts
  - [ ] GetDeliveriesUseCase.spec.ts
- [ ] Tests para Controllers en `tests/infrastructure/controllers/`
  - [ ] TransactionsController.spec.ts
  - [ ] CustomersController.spec.ts
  - [ ] ProductsController.spec.ts
  - [ ] DeliveriesController.spec.ts
- [ ] Tests para Repositorios en `tests/infrastructure/database/repositories/`
- [ ] Tests para Servicios Externos en `tests/infrastructure/external/`
- [ ] Mocks de repositorios y servicios externos
- [ ] Casos de éxito y error
- [ ] Validación de Either pattern
- [ ] Coverage report >= 80%

### 15. Integración Tests

- [ ] Tests E2E en `test/app.e2e-spec.ts`
- [ ] Flujo completo: Crear transacción → Procesar pago → Crear entrega → Actualizar stock
- [ ] Validación de respuestas HTTP
- [ ] Validación de estado de base de datos

---

## Requisitos de Deployment y DevOps

### 16. Cloud Deployment (AWS)

- [ ] Seleccionar servicio AWS (Lambda, ECS, EC2, etc.)
- [ ] Configurar base de datos (RDS para PostgreSQL)
- [ ] Variables de entorno en cloud
- [ ] HTTPS con certificados válidos
- [ ] Logs centralizados
- [ ] Monitoreo y alertas
- [ ] URL pública del API funcionando

### 17. Infraestructura Local (Docker)

- [ ] Docker Compose para PostgreSQL + App
- [ ] Dockerfile para aplicación NestJS
- [ ] Variables de entorno en .env
- [ ] Volúmenes persistentes para BD

---

## Requisitos de Documentación

### 18. README.md Completo

- [ ] Descripción del proyecto
- [ ] Requisitos: Node.js, npm, Docker, PostgreSQL
- [ ] Instrucciones de instalación local
- [ ] Instrucciones de deploy a cloud
- [ ] Variables de entorno necesarias
- [ ] Estructura de carpetas y arquitectura
- [ ] Diagrama de BD (schema)
- [ ] Links a documentación (Swagger, Postman)
- [ ] Coverage report (%)
- [ ] Credenciales de Wompi (sandbox)
- [ ] Comandos para desarrollar, testear, buildear

### 19. Postman Collection

- [ ] Crear/actualizar Postman Collection
- [ ] Todos los endpoints incluidos
- [ ] Ejemplos de requests y responses
- [ ] Variables de entorno
- [ ] Link público en README

### 20. Diagrama de Base de Datos

- [ ] Modelo ER (Entity-Relationship)
- [ ] Tablas: customers, products, transactions, deliveries
- [ ] Relaciones entre entidades
- [ ] Tipos de datos y restricciones

---

## Requisitos de Limpieza de Código

### 21. Code Quality (BONUS)

- [ ] ESLint sin errores
- [ ] Prettier formatting consistente
- [ ] Nombres descriptivos de variables y funciones
- [ ] Sin código muerto o comentarios innecesarios
- [ ] Funciones con responsabilidad única (SRP)
- [ ] DRY - No Repeat Yourself
- [ ] Comments solo para lógica compleja
- [ ] Type safety con TypeScript strict mode

### 22. Configuración de Linting

- [ ] ESLint configurado correctamente
- [ ] Pre-commit hooks (opcional)
- [ ] CI/CD pipeline para verificar quality

---

## Criterios de Evaluación Resumidos

| Criterio | Puntos | Estado |
|----------|--------|--------|
| API funcionando correctamente | 20 | ⬜ |
| Unit testing >80% coverage | 30 | ⬜ |
| Deployment en Cloud | 20 | ⬜ |
| OWASP/HTTPS/Security headers | 5 (BONUS) | ⬜ |
| Hexagonal Architecture + ROP | 10 (BONUS) | ⬜ |
| Clean code | 10 (BONUS) | ⬜ |
| **TOTAL MÍNIMO** | **100** | ⬜ |

---

## Comandos Útiles

```bash
# Desarrollo
npm run start:dev        # Watch mode con hot reload
npm run test             # Unit tests
npm run test:watch      # Watch tests
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage + SonarQube
npm run lint            # ESLint
npm run build           # Compilar TypeScript
npm run start:prod      # Modo producción

# Docker
docker-compose up -d    # Iniciar BD + App
docker-compose down     # Detener servicios
```

---

**Última actualización**: 29/01/2026
**Estado**: Pendiente de implementación
