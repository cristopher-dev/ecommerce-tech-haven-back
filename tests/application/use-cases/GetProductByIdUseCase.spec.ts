import { Test, TestingModule } from '@nestjs/testing';
import { GetProductByIdUseCase } from '../../../src/application/use-cases/GetProductByIdUseCase';
import { ProductRepository } from '../../../src/domain/repositories/ProductRepository';
import { Product } from '../../../src/domain/entities/Product';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdUseCase,
        {
          provide: 'ProductRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
    mockProductRepository = module.get('ProductRepository');
  });

  it('should return product when found', async () => {
    const product = new Product('1', 'Product 1', 'Desc 1', 100, 10);
    mockProductRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(product);
    expect(mockProductRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return error when product not found', async () => {
    mockProductRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('999');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toContain('not found');
  });

  it('should return error when repository fails', async () => {
    mockProductRepository.findById.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
