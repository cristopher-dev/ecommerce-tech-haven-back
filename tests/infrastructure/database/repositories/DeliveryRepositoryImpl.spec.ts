import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRepositoryImpl } from '../../../../src/infrastructure/database/repositories/DeliveryRepositoryImpl';
import { DeliveryEntity } from '../../../../src/infrastructure/database/entities/DeliveryEntity';
import {
  Delivery,
  DeliveryStatus,
} from '../../../../src/domain/entities/Delivery';

describe('DeliveryRepositoryImpl', () => {
  let repository: DeliveryRepositoryImpl;
  let mockDeliveryEntityRepository: jest.Mocked<Repository<DeliveryEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryRepositoryImpl,
        {
          provide: getRepositoryToken(DeliveryEntity),
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

    repository = module.get<DeliveryRepositoryImpl>(DeliveryRepositoryImpl);
    mockDeliveryEntityRepository = module.get(
      getRepositoryToken(DeliveryEntity),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery', async () => {
      const deliveryData = {
        transactionId: 'txn-1',
        customerId: 'cust-1',
        status: DeliveryStatus.PENDING,
      };
      const entity = {
        id: '1',
        ...deliveryData,
        createdAt: new Date(),
      };
      mockDeliveryEntityRepository.create.mockReturnValue(entity);
      mockDeliveryEntityRepository.save.mockResolvedValue(entity);

      const result = await repository.create(deliveryData);

      expect(result).toBeInstanceOf(Delivery);
      expect(result.id).toBe('1');
      expect(result.transactionId).toBe('txn-1');
      expect(result.customerId).toBe('cust-1');
      expect(result.status).toBe(DeliveryStatus.PENDING);
      expect(mockDeliveryEntityRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        ...deliveryData,
      });
      expect(mockDeliveryEntityRepository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findById', () => {
    it('should return a delivery if found', async () => {
      const entity = {
        id: '1',
        transactionId: 'txn-1',
        customerId: 'cust-1',
        status: DeliveryStatus.PENDING,
        createdAt: new Date(),
      };
      mockDeliveryEntityRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Delivery);
      expect(result!.id).toBe('1');
      expect(mockDeliveryEntityRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if not found', async () => {
      mockDeliveryEntityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status', async () => {
      mockDeliveryEntityRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      await repository.updateStatus('1', DeliveryStatus.DELIVERED);

      expect(mockDeliveryEntityRepository.update).toHaveBeenCalledWith('1', {
        status: DeliveryStatus.DELIVERED,
      });
    });
  });

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      const entities = [
        {
          id: '1',
          transactionId: 'txn-1',
          customerId: 'cust-1',
          status: DeliveryStatus.PENDING,
          createdAt: new Date(),
        },
      ];
      mockDeliveryEntityRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Delivery);
      expect(result[0].id).toBe('1');
      expect(mockDeliveryEntityRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });
});
