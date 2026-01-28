import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseSeeder } from '../../../src/infrastructure/database/DatabaseSeeder';
import { ProductEntity } from '../../../src/infrastructure/database/entities/ProductEntity';

describe('DatabaseSeeder', () => {
  let seeder: DatabaseSeeder;
  let productRepository: Repository<ProductEntity>;

  beforeEach(async () => {
    const mockRepository = {
      count: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeeder,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    seeder = module.get<DatabaseSeeder>(DatabaseSeeder);
    productRepository = module.get(getRepositoryToken(ProductEntity));
  });

  it('should seed products if none exist', async () => {
    productRepository.count.mockResolvedValue(0);
    productRepository.save.mockResolvedValue({} as ProductEntity);

    // Call the private method directly for testing
    await (seeder as any).seedProducts();

    expect(productRepository.count).toHaveBeenCalled();
    expect(productRepository.save).toHaveBeenCalledTimes(1); // Saves the array
    expect(productRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'prod-1' }),
        expect.objectContaining({ id: 'prod-2' }),
        // etc.
      ]),
    );
  });

  it('should not seed products if some exist', async () => {
    productRepository.count.mockResolvedValue(1);

    await (seeder as any).seedProducts();

    expect(productRepository.count).toHaveBeenCalled();
    expect(productRepository.save).not.toHaveBeenCalled();
  });
});
