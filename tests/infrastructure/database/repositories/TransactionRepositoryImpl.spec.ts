import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryImpl } from '../../../../src/infrastructure/database/repositories/TransactionRepositoryImpl';
import { TransactionEntity } from '../../../../src/infrastructure/database/entities/TransactionEntity';
import {
  Transaction,
  TransactionStatus,
} from '../../../../src/domain/entities/Transaction';

describe('TransactionRepositoryImpl', () => {
  let repository: TransactionRepositoryImpl;
  let mockTransactionEntityRepository: jest.Mocked<
    Repository<TransactionEntity>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepositoryImpl,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TransactionRepositoryImpl>(
      TransactionRepositoryImpl,
    );
    mockTransactionEntityRepository = module.get(
      getRepositoryToken(TransactionEntity),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const transactionData = {
        customerId: 'cust-1',
        productId: 'prod-1',
        amount: 100,
        status: TransactionStatus.PENDING,
        transactionId: 'TXN-20250130-0001',
        orderId: 'ORD-20250130-0001',
        quantity: 1,
      };
      const entity = {
        id: '1',
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTransactionEntityRepository.create.mockReturnValue(entity);
      mockTransactionEntityRepository.save.mockResolvedValue(entity);

      const result = await repository.create(transactionData);

      expect(result).toBeInstanceOf(Transaction);
      expect(result.id).toBe('1');
      expect(result.customerId).toBe('cust-1');
      expect(result.productId).toBe('prod-1');
      expect(result.amount).toBe(100);
      expect(result.status).toBe(TransactionStatus.PENDING);
      expect(result.transactionId).toBe('TXN-20250130-0001');
      expect(result.orderId).toBe('ORD-20250130-0001');
      expect(result.quantity).toBe(1);
      expect(mockTransactionEntityRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        ...transactionData,
      });
      expect(mockTransactionEntityRepository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findById', () => {
    it('should return a transaction if found', async () => {
      const entity = {
        id: '1',
        customerId: 'cust-1',
        productId: 'prod-1',
        amount: 100,
        status: TransactionStatus.PENDING,
        transactionId: 'TXN-20250130-0001',
        orderId: 'ORD-20250130-0001',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTransactionEntityRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Transaction);
      expect(result!.id).toBe('1');
      expect(result!.transactionId).toBe('TXN-20250130-0001');
      expect(result!.orderId).toBe('ORD-20250130-0001');
      expect(result!.quantity).toBe(1);
      expect(mockTransactionEntityRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if not found', async () => {
      mockTransactionEntityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      mockTransactionEntityRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      await repository.updateStatus('1', TransactionStatus.APPROVED);

      expect(mockTransactionEntityRepository.update).toHaveBeenCalledWith('1', {
        status: TransactionStatus.APPROVED,
      });
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const entities = [
        {
          id: '1',
          customerId: 'cust-1',
          productId: 'prod-1',
          amount: 100,
          status: TransactionStatus.PENDING,
          transactionId: 'TXN-20250130-0001',
          orderId: 'ORD-20250130-0001',
          quantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockTransactionEntityRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Transaction);
      expect(result[0].id).toBe('1');
      expect(result[0].transactionId).toBe('TXN-20250130-0001');
      expect(mockTransactionEntityRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });
});
