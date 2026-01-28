import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.length).toBeGreaterThan(0);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body[0]).toHaveProperty('id');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body[0]).toHaveProperty('name');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body[0]).toHaveProperty('price');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body[0]).toHaveProperty('stock');
      });
  });

  it('/customers (GET)', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get('/transactions')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/deliveries (GET)', () => {
    return request(app.getHttpServer())
      .get('/deliveries')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
