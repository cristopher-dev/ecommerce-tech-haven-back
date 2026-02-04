import { InMemoryCustomerRepository } from '../../../src/infrastructure/repositories/InMemoryCustomerRepository';
import { Customer } from '../../../src/domain/entities/Customer';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('InMemoryCustomerRepository', () => {
  let repo: InMemoryCustomerRepository;

  beforeEach(() => {
    repo = new InMemoryCustomerRepository();
  });

  it('should create customer', async () => {
    const customer = await repo.create({
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    });

    expect(customer.id).toBe('mock-uuid');
    expect(customer.name).toBe('John Doe');
  });

  it('should find customer by id', async () => {
    const created = await repo.create({
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    });

    const found = await repo.findById(created.id);
    expect(found).toEqual(created);
  });

  it('should return null when customer not found', async () => {
    const found = await repo.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should return all customers', async () => {
    await repo.create({
      name: 'John',
      email: 'john@example.com',
      address: 'Addr1',
    });
    await repo.create({
      name: 'Jane',
      email: 'jane@example.com',
      address: 'Addr2',
    });

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it('should save customer when already exists', async () => {
    const created = await repo.create({
      name: 'John',
      email: 'john@example.com',
      address: 'Old Address',
    });

    const updatedCustomer = new Customer(
      created.id,
      'Jane',
      'jane@example.com',
      'New Address',
    );
    const result = await repo.save(updatedCustomer);

    expect(result.name).toBe('Jane');
    expect(result.address).toBe('New Address');
  });

  it('should save customer when new', async () => {
    const newCustomer = new Customer(
      'test-id',
      'Alice',
      'alice@example.com',
      'Test Address',
    );
    const result = await repo.save(newCustomer);

    expect(result.id).toBe('test-id');
    expect(result.name).toBe('Alice');
  });

  it('should find customer by email', async () => {
    await repo.create({
      name: 'John',
      email: 'john@example.com',
      address: 'Addr',
    });

    const found = await repo.findByEmail('john@example.com');
    expect(found?.name).toBe('John');
  });

  it('should return null when customer not found by email', async () => {
    const found = await repo.findByEmail('nonexistent@example.com');
    expect(found).toBeNull();
  });
});
