import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../src/infrastructure/controllers/ProductsController';
import { GetProductsUseCase } from '../../../src/application/use-cases/GetProductsUseCase';
import { Product } from '../../../src/domain/entities/Product';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockUseCase: jest.Mocked<GetProductsUseCase>;

  beforeEach(async () => {
    const mockUC = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: GetProductsUseCase, useValue: mockUC }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    mockUseCase = module.get(GetProductsUseCase);
  });

  it('should return products', async () => {
    const products: Product[] = [new Product('1', 'Prod', 'Desc', 100, 10)];
    mockUseCase.execute.mockResolvedValue({ _tag: 'Right', right: products });

    const result = await controller.getProducts();

    expect(result).toEqual(products);
  });

  it('should throw error on failure', async () => {
    mockUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Error'),
    });

    await expect(controller.getProducts()).rejects.toThrow('Error');
  });
});
