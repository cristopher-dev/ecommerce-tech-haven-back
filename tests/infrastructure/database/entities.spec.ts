import 'reflect-metadata';
import { CustomerEntity } from '../../../src/infrastructure/database/entities/CustomerEntity';
import { DeliveryEntity } from '../../../src/infrastructure/database/entities/DeliveryEntity';
import { ProductEntity } from '../../../src/infrastructure/database/entities/ProductEntity';
import { TransactionEntity } from '../../../src/infrastructure/database/entities/TransactionEntity';

describe('Database Entities', () => {
  describe('CustomerEntity', () => {
    it('should instantiate CustomerEntity', () => {
      const entity = new CustomerEntity();
      entity.id = '1';
      entity.name = 'John Doe';
      entity.email = 'john@example.com';
      entity.address = '123 Main St';
      expect(entity.id).toBe('1');
      expect(entity.name).toBe('John Doe');
      expect(entity.email).toBe('john@example.com');
      expect(entity.address).toBe('123 Main St');
    });
  });

  describe('DeliveryEntity', () => {
    it('should instantiate DeliveryEntity', () => {
      const entity = new DeliveryEntity();
      entity.id = '1';
      entity.transactionId = 'txn-1';
      entity.status = 'PENDING';
      entity.deliveryDate = new Date();
      entity.address = '123 Main St';
      expect(entity.id).toBe('1');
      expect(entity.transactionId).toBe('txn-1');
      expect(entity.status).toBe('PENDING');
      expect(entity.address).toBe('123 Main St');
    });
  });

  describe('ProductEntity', () => {
    it('should instantiate ProductEntity', () => {
      const entity = new ProductEntity();
      entity.id = '1';
      entity.name = 'Product 1';
      entity.price = 100;
      entity.stock = 10;
      expect(entity.id).toBe('1');
      expect(entity.name).toBe('Product 1');
      expect(entity.price).toBe(100);
      expect(entity.stock).toBe(10);
    });
  });

  describe('TransactionEntity', () => {
    it('should instantiate TransactionEntity', () => {
      const entity = new TransactionEntity();
      entity.id = '1';
      entity.customerId = 'cust-1';
      entity.productId = 'prod-1';
      entity.amount = 100;
      entity.status = 'PENDING';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      expect(entity.id).toBe('1');
      expect(entity.customerId).toBe('cust-1');
      expect(entity.productId).toBe('prod-1');
      expect(entity.amount).toBe(100);
      expect(entity.status).toBe('PENDING');
    });
  });
});
