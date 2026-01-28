import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepositoryImpl } from '../../../../src/infrastructure/database/repositories/CustomerRepositoryImpl';
import { CustomerEntity } from '../../../../src/infrastructure/database/entities/CustomerEntity';
import { Customer } from '../../../../src/domain/entities/Customer';

describe('CustomerRepositoryImpl', () => {
  let repository: CustomerRepositoryImpl;
  let mockCustomerEntityRepository: jest.Mocked<Repository<CustomerEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepositoryImpl,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<CustomerRepositoryImpl>(CustomerRepositoryImpl);
    mockCustomerEntityRepository = module.get(
      getRepositoryToken(CustomerEntity),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
      };
      const entity = {
        id: '1',
        ...customerData,
      };
      mockCustomerEntityRepository.create.mockReturnValue(entity);
      mockCustomerEntityRepository.save.mockResolvedValue(entity);

      const result = await repository.create(customerData);

      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.address).toBe('123 Main St');
      expect(mockCustomerEntityRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        ...customerData,
      });
      expect(mockCustomerEntityRepository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findById', () => {
    it('should return a customer if found', async () => {
      const entity = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
      };
      mockCustomerEntityRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Customer);
      expect(result!.id).toBe('1');
      expect(mockCustomerEntityRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if not found', async () => {
      mockCustomerEntityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const entities = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St',
        },
      ];
      mockCustomerEntityRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Customer);
      expect(result[0].id).toBe('1');
      expect(mockCustomerEntityRepository.find).toHaveBeenCalled();
    });
  });
});
