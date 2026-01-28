# Backend de Pagos Wompi

API backend para el procesamiento de pagos de Wompi, implementada con NestJS y arquitectura hexagonal.

## Tabla de Contenidos

- [Backend de Pagos Wompi](#backend-de-pagos-wompi)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Arquitectura](#arquitectura)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Mejores Prácticas](#mejores-prácticas)
  - [Modelo de Datos](#modelo-de-datos)
    - [Producto](#producto)
    - [Cliente](#cliente)
    - [Transacción](#transacción)
    - [Entrega](#entrega)
  - [Endpoints de la API](#endpoints-de-la-api)
  - [Configuración](#configuración)
    - [Variables de Entorno (.env)](#variables-de-entorno-env)
  - [Desarrollo Local](#desarrollo-local)
    - [Prerrequisitos](#prerrequisitos)
    - [Instalación](#instalación)
    - [Base de Datos](#base-de-datos)
    - [Ejecutar](#ejecutar)
  - [Pruebas](#pruebas)
  - [Documentación de Swagger](#documentación-de-swagger)
  - [Configuración de Docker](#configuración-de-docker)
  - [Despliegue](#despliegue)
  - [Colección de Postman](#colección-de-postman)

## Arquitectura

- **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- **Programación Orientada a Ferrocarriles**: Manejo funcional de errores con fp-ts
- **Base de Datos**: PostgreSQL con TypeORM
- **Pruebas**: Jest con cobertura actual del 80%

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal organizada en las siguientes capas:

- **src/domain/**: Entidades y repositorios del dominio de negocio
- **src/application/**: Casos de uso y lógica de aplicación
- **src/infrastructure/**: Controladores, base de datos y servicios externos
- **test/**: Pruebas end-to-end
- **tests/**: Pruebas unitarias e de integración

Esta estructura asegura una separación clara de responsabilidades y facilita el mantenimiento y las pruebas.

## Mejores Prácticas

Este proyecto sigue las mejores prácticas de desarrollo con NestJS:

- **Inyección de Dependencias**: Uso de decoradores como `@Injectable()` para servicios y repositorios
- **Validación de Entradas**: DTOs con `class-validator` para validar datos de entrada
- **Manejo de Errores**: Filtros de excepciones globales para respuestas de error consistentes
- **Pruebas Unitarias e Integración**: Cobertura completa con Jest
- **Documentación**: Swagger para documentación interactiva de la API

## Modelo de Datos

### Producto

- id: string (UUID)
- name: string
- description: string
- price: decimal(10,2)
- stock: integer

### Cliente

- id: string (UUID)
- name: string
- email: string
- address: string

### Transacción

- id: string (UUID)
- customerId: string (FK)
- productId: string (FK)
- amount: decimal(10,2)
- status: enum (PENDING, APPROVED, DECLINED)
- createdAt: timestamp
- updatedAt: timestamp

### Entrega

- id: string (UUID)
- transactionId: string (FK)
- customerId: string (FK)
- status: enum (PENDING, ASSIGNED, SHIPPED, DELIVERED)
- createdAt: timestamp

## Endpoints de la API

- GET /products - Listar productos con stock
- GET /transactions - Listar transacciones
- POST /transactions - Crear transacción pendiente
- PUT /transactions/:id/process-payment - Procesar pago con Wompi
- GET /customers - Listar clientes
- GET /deliveries - Listar entregas

## Configuración

### Variables de Entorno (.env)

```env
# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wompi_user
DATABASE_PASSWORD=wompi_password
DATABASE_NAME=wompi_db

# Entorno
NODE_ENV=development

# API de Wompi - Sandbox
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

Opción 2: PostgreSQL Local

Asegúrate de que PostgreSQL esté ejecutándose y crea la base de datos `wompi_db`.

### Ejecutar

```bash
# Desarrollo con recarga automática
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Pruebas

```bash
# Ejecutar pruebas
npm test

# Con cobertura
npm run test:cov

# Pruebas E2E
npm run test:e2e
```

**Cobertura actual: 56.94%**

## Documentación de Swagger

La documentación de la API está disponible a través de Swagger UI en `/api` cuando la aplicación está ejecutándose.

- **URL**: `http://localhost:3000/api` (desarrollo local)
- **Características**: Documentación interactiva de la API con ejemplos de solicitudes/respuestas, definiciones de esquemas y capacidades de prueba

## Configuración de Docker

Para ejecutar PostgreSQL localmente usando Docker:

```bash
cd docker
docker-compose up -d
```

Consulta `docker/README.md` para más detalles.

## Despliegue

Desplegado en AWS (enlace por agregar).

## Colección de Postman

Importa la colección de Postman desde el archivo: [`Wompi Payment Backend.postman_collection.json`](./Wompi%20Payment%20Backend.postman_collection.json)

Esta colección incluye todos los endpoints de la API con solicitudes de ejemplo y variables para facilitar las pruebas.
