# TODO.md - Checklist para Verificación Completa del Backend Wompi Payment

Este archivo contiene checklists detallados basados en los requisitos del test para asegurar que el backend esté completamente funcional y cumpla con todas las especificaciones.

## Arquitectura y Diseño

### Hexagonal Architecture

- [x] Separación clara entre capas: Domain, Application, Infrastructure
- [x] Interfaces (ports) en domain/repositories
- [x] Implementaciones (adapters) en infrastructure
- [x] Controladores solo manejan HTTP, no lógica de negocio
- [x] Dependencias inyectadas correctamente

### Railway Oriented Programming (ROP)

- [x] Uso de fp-ts para manejo funcional de errores
- [x] TaskEither en use cases para operaciones asíncronas
- [x] Pipe y chain para composición de operaciones
- [x] Validación y transformación en railway

## Base de Datos y Modelado

### Configuración de Base de Datos

- [x] PostgreSQL configurado (TypeORM)
- [x] Variables de entorno para conexión DB
- [x] Docker Compose para DB local
- [x] Migraciones o sincronización automática

### Data Model Design

- [x] Entidad Product: id, name, description, price, stock
- [x] Entidad Customer: id, name, email, address
- [x] Entidad Transaction: id, customerId, productId, amount, status, timestamps
- [x] Entidad Delivery: id, transactionId, customerId, status, timestamps
- [x] Relaciones correctas (FKs)
- [x] Enums para status (PENDING, APPROVED, DECLINED, etc.)

### Seeding

- [x] DatabaseSeeder implementado
- [x] Productos dummy creados al iniciar la app
- [x] Verificación para no duplicar seeds
- [x] Datos realistas y variados

## API Endpoints

### Recursos Implementados

- [x] Products (stock)
- [x] Transactions
- [x] Customers
- [x] Deliveries

### Endpoints Específicos

- [x] GET /products - Listar productos con stock
- [x] GET /transactions - Listar transacciones
- [x] POST /transactions - Crear transacción pendiente
- [x] PUT /transactions/:id/process-payment - Procesar pago
- [x] GET /customers - Listar clientes
- [x] GET /deliveries - Listar entregas

### Validaciones

- [x] Validación de entrada en use cases (no solo controllers)
- [x] Validación de stock antes de crear transacción
- [x] Validación de datos de cliente (email, etc.)
- [x] Validación de cantidad > 0
- [x] Manejo de errores **apropiado**

### Manejo Seguro de Datos

- [x] Datos sensibles (tarjetas) no almacenados en DB
- [x] Validación de estructura de tarjetas (fake data)
- [x] Uso de HTTPS en producción
- [x] Headers de seguridad (bonus)

## Integración Wompi

### Configuración Sandbox

- [x] Variables de entorno para API keys
- [x] URL sandbox correcta
- [x] Keys proporcionadas en .env.example

### Servicio de Pago

- [x] Interfaz WompiPaymentService
- [x] Implementación MockWompiPaymentService
- [x] Implementación real de Wompi API (llamada completa)
- [x] Llamada de verificación de conectividad
- [x] Lógica de aprobación/declinación
- [x] Manejo de errores

### Flujo de Pago

- [x] Crear transacción PENDING
- [x] Llamar a Wompi API
- [x] Actualizar status de transacción
- [x] Actualizar stock si aprobado
- [x] Asignar delivery si aprobado

## Testing

### Configuración de Tests

- [x] Jest configurado
- [x] Scripts npm para test:cov
- [x] Resultados en README.md

### Cobertura de Tests

- [x] Unit tests para use cases
- [x] Unit tests para repositories
- [x] Unit tests para controllers
- [x] Unit tests para servicios externos
- [x] E2E tests para API endpoints
- [x] Cobertura >80% (actual: 90.09%)
- [x] Mocks para dependencias externas

## Documentación y Configuración

### README.md

- [x] Data model design documentado
- [x] API endpoints listados
- [x] Configuración de environment
- [x] Instrucciones de instalación y ejecución
- [x] Resultados de tests con cobertura
- [x] Link a Postman Collection
- [x] Link a Swagger (/api)
- [x] Instrucciones de deployment

### Swagger/OpenAPI

- [x] Swagger configurado en main.ts
- [x] Documentación automática de endpoints
- [x] Disponible en /api

### Postman Collection

- [x] Collection creada y link proporcionado
- [x] Ejemplos de requests para todos los endpoints
- [x] Variables de entorno configuradas

## Deployment

### Infraestructura

- [ ] Desplegado en AWS (o similar)
- [ ] Base de datos en la nube (RDS/DynamoDB)
- [ ] App corriendo en Lambda/ECS/EKS
- [ ] CDN con CloudFront/S3
- [ ] Variables de entorno configuradas
- [ ] HTTPS habilitado

### Resiliencia

- [ ] App maneja refreshes del cliente
- [ ] Manejo de errores robusto
- [ ] Logging apropiado
- [ ] Monitoreo básico

## Seguridad (Bonus)

### OWASP Alignments

- [x] Validación de input (mejorar DTOs con class-validator)
- [x] Protección contra inyección
- [x] Manejo seguro de secrets
- [x] Rate limiting
- [x] CORS configurado

### Headers de Seguridad

- [x] HTTPS obligatorio
- [x] Security headers (HSTS, CSP, etc.) - agregar helmet
- [x] Content Security Policy

## Mejoras Adicionales (Basado en Revisión de leer.txt)

### README.md Completado

- [x] Enlace público a Swagger en README
- [x] Colección Postman actualizada y link en README
- [x] Diseño de modelo de datos (ER diagram) en README
- [x] Resultados de pruebas con cobertura en README
- [x] Instrucciones de despliegue en README

### Validaciones Mejoradas

- [x] Validación Luhn para números de tarjeta
- [x] Detección Visa/Mastercard en frontend (pero backend validar formato)
- [x] Validaciones más estrictas en DTOs (email, longitudes, rangos)
- [x] Manejo de errores con códigos HTTP específicos

### Arquitectura y ROP

- [ ] Documentar aplicación de Hexagonal/ROP en README
- [ ] Mejorar pipelines con fp-ts (más TaskEither)

### Testing Enhancements

- [x] Cobertura actualizada (90.09% logrado)
- [ ] Badge de cobertura en README

### Deployments

- [ ] Configurar CI/CD con GitHub Actions
- [ ] Desplegar en AWS free tier
- [ ] Verificar HTTPS y seguridad en producción

## Calidad de Código

### Clean Code

- [x] Nombres descriptivos
- [x] Funciones pequeñas y enfocadas
- [x] Comentarios cuando necesario
- [x] Sin código duplicado

### Linting y Formateo

- [x] ESLint configurado
- [x] Prettier configurado
- [x] Scripts npm para lint y format

## Validación Final

### Funcionalidad Completa

- [x] Crear transacción pendiente
- [x] Procesar pago con Wompi
- [x] Actualizar stock
- [x] Asignar delivery
- [x] Listar recursos
- [x] Manejo de errores

### Edge Cases

- [x] Stock insuficiente
- [x] Pago declinado
- [x] Transacción no encontrada
- [x] Datos inválidos

### Performance

- [x] Consultas eficientes
- [x] Sin N+1 queries
- [x] Índices apropiados (si necesario)

---

## Validación Local Completada

- [x] Tests pasan (88/88)
- [x] Lint sin errores
- [x] Build exitoso
- [x] App inicia correctamente
- [x] Conexión DB PostgreSQL
- [x] Sincronización tablas TypeORM
- [x] Seeding productos funciona
- [x] Endpoints mapeados correctamente
- [x] Swagger configurado
- [x] Integración Wompi API implementada (tokenización + transacción)

- Marcar [x] cuando esté implementado y verificado
- Agregar comentarios si algo está parcialmente implementado
- Revisar contra el archivo leer.txt para asegurar cumplimiento
- Ejecutar tests y verificar cobertura antes de marcar como completo
- Probar endpoints manualmente con Postman/Swagger
- Verificar deployment funciona correctamente

**Puntuación Objetivo:** Al menos 100 puntos según rubrics del test.
