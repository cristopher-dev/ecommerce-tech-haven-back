import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@techhaven.com',
        password: 'admin123',
      })
      .expect(HttpStatus.OK);

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect((res.body as any[]).length).toBeGreaterThan(0);
        expect((res.body as any[])[0]).toHaveProperty('id');
        expect((res.body as any[])[0]).toHaveProperty('name');
        expect((res.body as any[])[0]).toHaveProperty('price');
        expect((res.body as any[])[0]).toHaveProperty('stock');
      });
  });

  it('/customers (GET)', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/deliveries (GET)', () => {
    return request(app.getHttpServer())
      .get('/deliveries')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/transactions (POST) - Create Transaction', async () => {
    const productsResponse = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer',
      customerEmail: `test-${Date.now()}@example.com`,
      customerAddress: '123 Test St',
      deliveryInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+573001234567',
        address: '123 Test St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
      },
      items: [{ productId, quantity: 1 }],
    };

    return request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED);
  });

  it('/transactions/:id/process-payment (PUT) - Process Payment', async () => {
    const productsResponse = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer Payment',
      customerEmail: `payment-${Date.now()}@example.com`,
      customerAddress: '123 Test St',
      deliveryInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+573001234567',
        address: '123 Test St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
      },
      items: [{ productId, quantity: 1 }],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED);

    // Extract transaction ID - prefer UUID id, fallback to transactionId
    let transactionId: string;
    console.log('Create Response body:', JSON.stringify(createResponse.body));
    if (createResponse.body.id && createResponse.body.id !== null) {
      transactionId = createResponse.body.id;
      console.log('Using UUID id:', transactionId);
    } else if (createResponse.body.transactionId) {
      transactionId = createResponse.body.transactionId;
      console.log('Using transactionId:', transactionId);
    } else {
      console.log('No ID found, body keys:', Object.keys(createResponse.body));
      throw new Error('No transaction ID returned from POST');
    }

    const cardData = {
      cardNumber: '4111111111111111',
      expirationMonth: '12',
      expirationYear: '25',
      cvv: '123',
      cardholderName: 'Test Customer',
    };

    return request(app.getHttpServer())
      .put(`/transactions/${transactionId}/process-payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(cardData)
      .expect(HttpStatus.OK);
  });

  describe('Product Endpoints', () => {
    it('GET /products/:id - Get product by ID', async () => {
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      const productId = (productsResponse.body as { id: string }[])[0].id;

      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', productId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('price');
          expect(res.body).toHaveProperty('stock');
        });
    });

    it('GET /products/:id - Non-existent product returns 404', async () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Customer Endpoints', () => {
    it('POST /customers - Create new customer', async () => {
      const createCustomerDto = {
        name: 'New Customer',
        email: `customer-${Date.now()}@example.com`,
        address: '456 New Street',
      };

      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCustomerDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', createCustomerDto.name);
          expect(res.body).toHaveProperty('email', createCustomerDto.email);
          expect(res.body).toHaveProperty('address', createCustomerDto.address);
        });
    });

    it('GET /customers/:id - Get customer by ID', async () => {
      const customersResponse = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      if ((customersResponse.body as any[]).length === 0) {
        const createCustomerDto = {
          name: 'Test Customer',
          email: `test-${Date.now()}@example.com`,
          address: 'Test Address',
        };

        const createResponse = await request(app.getHttpServer())
          .post('/customers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createCustomerDto)
          .expect(HttpStatus.CREATED);

        const customerId = (createResponse.body as { id: string }).id;

        return request(app.getHttpServer())
          .get(`/customers/${customerId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', customerId);
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('email');
          });
      }

      const customerId = (customersResponse.body as { id: string }[])[0].id;

      return request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', customerId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('email');
        });
    });
  });

  describe('Transaction Endpoints', () => {
    it('GET /transactions/:id - Get transaction by ID', async () => {
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      const productId = (productsResponse.body as { id: string }[])[0].id;

      const createTransactionDto = {
        customerName: 'Transaction Test',
        customerEmail: `txn-${Date.now()}@example.com`,
        customerAddress: 'Transaction Address',
        deliveryInfo: {
          firstName: 'Trans',
          lastName: 'Action',
          phone: '+573001234567',
          address: 'Transaction Address',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
        },
        items: [{ productId, quantity: 1 }],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(HttpStatus.CREATED);

      const transactionId =
        createResponse.body.id ||
        createResponse.body.transactionId ||
        'unknown';

      return request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'PENDING');
          expect(res.body).toHaveProperty('amount');
        });
    });
  });

  describe('Delivery Endpoints', () => {
    it('GET /deliveries/:id - Get delivery by ID', async () => {
      const deliveriesResponse = await request(app.getHttpServer())
        .get('/deliveries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      if ((deliveriesResponse.body as any[]).length > 0) {
        const deliveryId = (deliveriesResponse.body as { id: string }[])[0].id;

        return request(app.getHttpServer())
          .get(`/deliveries/${deliveryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', deliveryId);
            expect(res.body).toHaveProperty('transactionId');
          });
      }
    });
  });

  describe('Complete Payment Workflow', () => {
    it('Create Transaction → Process Payment → Verify Status', async () => {
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      const productId = (productsResponse.body as { id: string }[])[0].id;

      const createTransactionDto = {
        customerName: 'Workflow Test',
        customerEmail: `workflow-${Date.now()}@example.com`,
        customerAddress: 'Workflow Address',
        deliveryInfo: {
          firstName: 'Work',
          lastName: 'Flow',
          phone: '+573001234567',
          address: 'Workflow Address',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
        },
        items: [{ productId, quantity: 1 }],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(HttpStatus.CREATED);

      // Extract transaction ID - prefer UUID id, fallback to transactionId
      let transactionId: string;
      if (createResponse.body.id && createResponse.body.id !== null) {
        transactionId = createResponse.body.id;
      } else if (createResponse.body.transactionId) {
        transactionId = createResponse.body.transactionId;
      } else {
        throw new Error('No transaction ID returned from POST');
      }

      expect(createResponse.body).toHaveProperty('status', 'PENDING');

      const getResponse = await request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      expect(getResponse.body).toHaveProperty('status', 'PENDING');

      const cardData = {
        cardNumber: '4111111111111111',
        expirationMonth: '12',
        expirationYear: '25',
        cvv: '123',
        cardholderName: 'Workflow Test',
      };

      const paymentResponse = await request(app.getHttpServer())
        .put(`/transactions/${transactionId}/process-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cardData)
        .expect(HttpStatus.OK);

      expect(paymentResponse.body).toHaveProperty('status');
      expect(['APPROVED', 'DECLINED']).toContain(paymentResponse.body.status);

      if (paymentResponse.body.status === 'APPROVED') {
        const deliveriesResponse = await request(app.getHttpServer())
          .get('/deliveries')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.OK);

        const delivery = (deliveriesResponse.body as any[]).find(
          (d) => d.transactionId === transactionId,
        );
        expect(delivery).toBeDefined();
      }
    });
  });
});
