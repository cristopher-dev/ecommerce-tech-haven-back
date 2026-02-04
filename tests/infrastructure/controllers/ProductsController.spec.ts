import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../src/infrastructure/controllers/ProductsController';
import { GetProductsUseCase } from '../../../src/application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../../src/application/use-cases/GetProductByIdUseCase';
import { Product } from '../../../src/domain/entities/Product';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockUseCase: jest.Mocked<GetProductsUseCase>;
  let mockGetProductByIdUseCase: jest.Mocked<GetProductByIdUseCase>;

  beforeEach(async () => {
    const mockUC = {
      execute: jest.fn(),
    };
    const mockByIdUC = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: GetProductsUseCase, useValue: mockUC },
        { provide: GetProductByIdUseCase, useValue: mockByIdUC },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    mockUseCase = module.get(GetProductsUseCase);
    mockGetProductByIdUseCase = module.get(GetProductByIdUseCase);
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

  it('should return product by id', async () => {
    const product = new Product(
      'prod-1',
      'Product Name',
      'Product Description',
      99.99,
      50,
    );
    mockGetProductByIdUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: product,
    });

    const result = await controller.getProductById('prod-1');

    expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('prod-1');
    expect(result).toEqual(product);
  });

  it('should throw error on get product by id failure', async () => {
    mockGetProductByIdUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Product not found'),
    });

    await expect(controller.getProductById('nonexistent')).rejects.toThrow(
      'Product not found',
    );
  });

  it('should handle empty product list', async () => {
    mockUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: [],
    });

    const result = await controller.getProducts();

    expect(result).toEqual([]);
  });

  it('should handle multiple products', async () => {
    const products: Product[] = [
      new Product('1', 'Product 1', 'Description 1', 10, 100),
      new Product('2', 'Product 2', 'Description 2', 20, 50),
      new Product('3', 'Product 3', 'Description 3', 30, 75),
    ];
    mockUseCase.execute.mockResolvedValue({ _tag: 'Right', right: products });

    const result = await controller.getProducts();

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[2].name).toBe('Product 3');
  });

  it('should preserve product properties', async () => {
    const product = new Product(
      'id-123',
      'Test Product',
      'Test Description',
      199.99,
      15,
    );
    mockGetProductByIdUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: product,
    });

    const result = await controller.getProductById('id-123');

    expect(result.id).toBe('id-123');
    expect(result.name).toBe('Test Product');
    expect(result.description).toBe('Test Description');
    expect(result.price).toBe(199.99);
  });
});
