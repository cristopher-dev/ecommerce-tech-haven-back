# Flujo de Pago con Tarjeta de Crédito - TechHaven

## 📋 Resumen del Proceso

El pago con tarjeta de crédito en TechHaven sigue un flujo de **4 pasos principales** que implementa completamente la API de Wompi.

---

## 🔄 Flujo Paso a Paso

### 1️⃣ **Obtener Tokens de Aceptación**

```http
GET /merchants/{publicKey}
```

- **Propósito**: Obtener tokens de términos y condiciones
- **Parámetros URL**:
  - `merchantPublicKey`: Llave pública del comercio
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**: Ninguno (GET method)

- **Response Body** (200 OK):

```json
{
  "data": {
    "presigned_acceptance": {
      "acceptance_token": "string",
      "permalink": "string",
      "type": "string"
    },
    "presigned_personal_data_auth": {
      "acceptance_token": "string", 
      "permalink": "string",
      "type": "string"
    }
  }
}
```

- **Campos obtenidos**:
  - `acceptance_token` - Términos y condiciones
  - `accept_personal_auth` - Autorización de datos personales
- **Uso**: Obligatorio para todas las transacciones

### 2️⃣ **Tokenizar Tarjeta**

```http
POST /tokens/cards
```

- **Propósito**: Proteger datos sensibles de la tarjeta
- **Headers**:
  - `Authorization: Bearer {publicKey}`
  - `Content-Type: application/json`

- **Request Body**:

```json
{
  "number": "4111111111111111",
  "exp_month": "12",
  "exp_year": "25", 
  "cvc": "123",
  "card_holder": "Juan Pérez"
}
```

- **Campos requeridos**:
  - `number` - Número de tarjeta (sin espacios)
  - `exp_month` - Mes de expiración (2 dígitos)
  - `exp_year` - Año de expiración (2 dígitos)
  - `cvc` - Código de seguridad
  - `card_holder` - Nombre del titular

- **Response Body** (201 Created):

```json
{
  "data": {
    "id": "tok_prod_1_B8L9kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ"
  }
}
```

- **Respuesta**: Token seguro `tok_prod_1_...`

### 3️⃣ **Crear Transacción**

```http
POST /transactions
```

- **Propósito**: Iniciar el proceso de pago
- **Headers**:
  - `Authorization: Bearer {privateKey}`
  - `Content-Type: application/json`

- **Request Body**:

```json
{
  "acceptance_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accept_personal_auth": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "amount_in_cents": 250000,
  "currency": "COP",
  "customer_email": "cliente@email.com",
  "reference": "txn_123456789",
  "payment_method": {
    "type": "CARD",
    "token": "tok_prod_1_B8L9kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ8kJ",
    "installments": 1
  }
}
```

- **Campos obligatorios**:
  - `acceptance_token` - Token de aceptación
  - `accept_personal_auth` - Token de datos personales
  - `amount_in_cents` - Monto en centavos (ej: 250000 = $2,500)
  - `currency` - "COP"
  - `customer_email` - Email del cliente
  - `reference` - ID único de la transacción
  - `payment_method.type` - "CARD"
  - `payment_method.token` - Token de la tarjeta
  - `payment_method.installments` - Número de cuotas (1 = sin cuotas)

- **Response Body** (201 Created):

```json
{
  "data": {
    "id": "txn_12345-67890-12345-67890",
    "status": "PENDING"
  }
}
```

### 4️⃣ **Consultar Estado (Long Polling)**

```http
GET /transactions/{wompiTransactionId}
```

- **Propósito**: Verificar resultado del pago (asíncrono)
- **Parámetros URL**:
  - `wompiTransactionId`: ID de transacción retornado en paso 3
- **Headers**:
  - `Authorization: Bearer {privateKey}`
  - `Content-Type: application/json`
- **Request Body**: Ninguno (GET method)

- **Response Body** (200 OK):

```json
{
  "data": {
    "id": "txn_12345-67890-12345-67890",
    "status": "APPROVED"
  }
}
```

- **Estados posibles**:
  - `PENDING` - En proceso (reintentar)
  - `APPROVED` - ✅ Pago aprobado
  - `DECLINED` - ❌ Pago rechazado
  - `ERROR` - ⚠️ Error en procesamiento
  - `VOIDED` - 🔄 Transacción anulada

---

## ⚙️ Configuración Técnica

### Variables de Entorno

```env
PAYMENT_API_URL=https://sandbox.wompi.co/v1
PAYMENT_PUBLIC_KEY=pub_test_...
PAYMENT_PRIVATE_KEY=prv_test_...
```

### Manejo de Errores

- **Cada paso** retorna `Either<Error, Result>`
- **Long polling**: 30 reintentos máximo (1.5 minutos)
- **Delay**: 50ms entre consultas
- **Logging**: Seguimiento visual con emojis

### Estados Finales

```typescript
enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}
```

---

## 🔧 Implementación en Código

### Flujo Principal

```typescript
// 1. Obtener tokens de aceptación
const tokens = await getAcceptanceTokens();

// 2. Tokenizar tarjeta
const cardToken = await tokenizeCard(cardData);

// 3. Crear transacción
const transactionId = await createTransaction(
  transactionId, amount, cardToken, email, tokens
);

// 4. Consultar estado (polling)
const finalStatus = await getTransactionStatus(transactionId);
```

### Manejo de Respuesta

```typescript
if (finalStatus === 'APPROVED') {
  // ✅ Crear delivery, actualizar inventario
} else if (finalStatus === 'DECLINED') {
  // ❌ Informar rechazo al usuario
} else {
  // ⏳ Aún pendiente o error
}
```

---

## 📊 Estados y Tiempos

| Estado    | Descripción          | Tiempo típico     |
|-----------|----------------------|-------------------|
| `PENDING` | Procesando pago      | 0-30 segundos     |
| `APPROVED`| Pago exitoso         | Inmediato         |
| `DECLINED`| Pago rechazado       | Inmediato         |
| `ERROR`   | Error técnico        | Inmediato         |

---

## 🔒 Seguridad

- ✅ **Nunca se guardan** datos de tarjeta
- ✅ **Tokens seguros** para cada transacción
- ✅ **Certificación PCI DSS** de Wompi
- ✅ **Tokens de aceptación** obligatorios
- ✅ **Validación de datos** en cada paso

---

## 🧪 Testing en Sandbox

Para pruebas usar:

- **URL**: `https://sandbox.wompi.co/v1`
- **Llaves de prueba**: `pub_test_` y `prv_test_`
- **Tarjetas de prueba**: Ver documentación de Wompi

---

## 📅 Última Actualización

Febrero 2026
