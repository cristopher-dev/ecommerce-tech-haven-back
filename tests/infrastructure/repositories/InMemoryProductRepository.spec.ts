import { InMemoryProductRepository } from '../../../src/infrastructure/repositories/InMemoryProductRepository';
import { Product } from '../../../src/domain/entities/Product';

describe('InMemoryProductRepository', () => {
  let repo: InMemoryProductRepository;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
  });

  it('should return all products', async () => {
    const products = await repo.findAll();
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Product 1');
  });

  it('should find product by id', async () => {
    const product = await repo.findById('1');
    expect(product).toBeDefined();
    expect(product?.id).toBe('1');
  });

  it('should return null for non-existent product', async () => {
    const product = await repo.findById('999');
    expect(product).toBeNull();
  });

  it('should do nothing when updating stock of non-existent product', async () => {
    await expect(repo.updateStock('999', 5)).resolves.toBeUndefined();
  });

  it('should update stock', async () => {
    await repo.updateStock('1', 5);
    const product = await repo.findById('1');
    expect(product?.stock).toBe(5);
  });
});
