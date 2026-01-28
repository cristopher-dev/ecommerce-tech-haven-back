import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryImpl } from '../../../../src/infrastructure/database/repositories/ProductRepositoryImpl';
import { ProductEntity } from '../../../../src/infrastructure/database/entities/ProductEntity';
import { Product } from '../../../../src/domain/entities/Product';

describe('ProductRepositoryImpl', () => {
  let repository: ProductRepositoryImpl;
  let mockProductEntityRepository: jest.Mocked<Repository<ProductEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepositoryImpl,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ProductRepositoryImpl>(ProductRepositoryImpl);
    mockProductEntityRepository = module.get(getRepositoryToken(ProductEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const entities = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          stock: 10,
        },
      ];
      mockProductEntityRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Product 1');
      expect(result[0].price).toBe(100);
      expect(result[0].stock).toBe(10);
      expect(mockProductEntityRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product if found', async () => {
      const entity = {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 10,
      };
      mockProductEntityRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Product);
      expect(result!.id).toBe('1');
      expect(mockProductEntityRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if not found', async () => {
      mockProductEntityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      mockProductEntityRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      await repository.updateStock('1', 5);

      expect(mockProductEntityRepository.update).toHaveBeenCalledWith('1', {
        stock: 5,
      });
    });
  });
});
