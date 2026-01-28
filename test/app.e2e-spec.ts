import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
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
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get('/transactions')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/deliveries (GET)', () => {
    return request(app.getHttpServer())
      .get('/deliveries')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/transactions (POST) - Create Transaction', async () => {
    // First, get a product ID
    const productsResponse = await request(app.getHttpServer())
      .get('/products')
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerAddress: '123 Test St',
      productId: productId,
      quantity: 1,
    };

    return request(app.getHttpServer())
      .post('/transactions')
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
      .expect(HttpStatus.OK);
    const productId = (productsResponse.body as { id: string }[])[0].id;

    const createTransactionDto = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerAddress: '123 Test St',
      productId: productId,
      quantity: 1,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED);

    const transactionId = (createResponse.body as { id: string }).id;

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test Customer',
    };

    return request(app.getHttpServer())
      .put(`/transactions/${transactionId}/process-payment`)
      .send(cardData)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', transactionId);
        expect(res.body).toHaveProperty('status', 'DECLINED'); // Mock declines if amount >= 500
        expect(res.body).toHaveProperty('updatedAt');
      });
  });
});
