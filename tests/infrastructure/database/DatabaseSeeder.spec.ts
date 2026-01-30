import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseSeeder } from '../../../src/infrastructure/database/DatabaseSeeder';
import { ProductEntity } from '../../../src/infrastructure/database/entities/ProductEntity';
import { UserEntity } from '../../../src/infrastructure/database/entities/UserEntity';

describe('DatabaseSeeder', () => {
  let seeder: DatabaseSeeder;
  let productRepository: Repository<ProductEntity>;
  let userRepository: Repository<UserEntity>;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockProductRepository = {
      count: jest.fn(),
      save: jest.fn(),
    };

    const mockUserRepository = {
      count: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeeder,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    seeder = module.get<DatabaseSeeder>(DatabaseSeeder);
    productRepository = module.get(getRepositoryToken(ProductEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should seed products and users if none exist', async () => {
    (productRepository.count as jest.Mock).mockResolvedValue(0);
    (userRepository.count as jest.Mock).mockResolvedValue(0);
    (productRepository.save as jest.Mock).mockResolvedValue(
      {} as ProductEntity,
    );
    (userRepository.save as jest.Mock).mockResolvedValue({} as UserEntity);

    await seeder.onModuleInit();

    expect(productRepository.count).toHaveBeenCalled();
    expect(userRepository.count).toHaveBeenCalled();
    expect(productRepository.save).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should skip seeding if products and users already exist', async () => {
    (productRepository.count as jest.Mock).mockResolvedValue(5);
    (userRepository.count as jest.Mock).mockResolvedValue(3);

    await seeder.onModuleInit();

    expect(productRepository.count).toHaveBeenCalled();
    expect(userRepository.count).toHaveBeenCalled();
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
