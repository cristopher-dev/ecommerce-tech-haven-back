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
    // First, get a product ID
    const productsResponse = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerAddress: '123 Test St',
      deliveryInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+573001234567',
        address: '123 Test St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
      },
      items: [{ productId, quantity: 1 }],
    };

    return request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('customerId');
        expect(res.body).toHaveProperty('productId', productId);
        expect(res.body).toHaveProperty('amount');
        expect(res.body).toHaveProperty('status', 'PENDING');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
      });
  });

  it('/transactions/:id/process-payment (PUT) - Process Payment', async () => {
    // First, create a transaction
    const productsResponse = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerAddress: '123 Test St',
      deliveryInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+573001234567',
        address: '123 Test St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
      },
      items: [{ productId, quantity: 1 }],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED);

    const transactionId = (createResponse.body as { id: string }).id;

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
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', transactionId);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('updatedAt');
      });
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
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body).toHaveProperty('message'); // Error message
        });
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
        // Create a customer if none exist
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
          zipCode: '110111',
        },
        items: [{ productId, quantity: 1 }],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(HttpStatus.CREATED);

      const transactionId = (createResponse.body as { id: string }).id;

      return request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', transactionId);
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
            expect(res.body).toHaveProperty('address');
          });
      }
    });
  });

  describe('Complete Payment Workflow', () => {
    it('Create Transaction → Process Payment → Verify Status', async () => {
      // Step 1: Get a product
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      const productId = (productsResponse.body as { id: string }[])[0].id;

      // Step 2: Create transaction
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
          zipCode: '110111',
        },
        items: [{ productId, quantity: 1 }],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(HttpStatus.CREATED);

      const transactionId = (createResponse.body as { id: string }).id;
      expect(createResponse.body).toHaveProperty('status', 'PENDING');

      // Step 3: Verify transaction can be retrieved
      const getResponse = await request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      expect(getResponse.body).toHaveProperty('id', transactionId);

      // Step 4: Process payment
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

      expect(paymentResponse.body).toHaveProperty('id', transactionId);
      expect(paymentResponse.body).toHaveProperty('status');
      expect(['APPROVED', 'DECLINED']).toContain(paymentResponse.body.status);

      // Step 5: If approved, delivery should exist
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
