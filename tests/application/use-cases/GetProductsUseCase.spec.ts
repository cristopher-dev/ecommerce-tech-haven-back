import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsUseCase } from '../../../src/application/use-cases/GetProductsUseCase';
import { ProductRepository } from '../../../src/domain/repositories/ProductRepository';
import { Product } from '../../../src/domain/entities/Product';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsUseCase,
        {
          provide: 'ProductRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetProductsUseCase>(GetProductsUseCase);
    mockProductRepository = module.get('ProductRepository');
  });

  it('should return products when repository succeeds', async () => {
    const products: Product[] = [
      new Product('1', 'Product 1', 'Desc 1', 100, 10),
    ];
    mockProductRepository.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(products);
    expect(mockProductRepository.findAll).toHaveBeenCalled();
  });

  it('should return error when repository fails', async () => {
    mockProductRepository.findAll.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
