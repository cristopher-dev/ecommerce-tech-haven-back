import { InMemoryTransactionRepository } from '../../../src/infrastructure/repositories/InMemoryTransactionRepository';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('InMemoryTransactionRepository', () => {
  let repo: InMemoryTransactionRepository;

  beforeEach(() => {
    repo = new InMemoryTransactionRepository();
  });

  it('should create transaction', async () => {
    const transaction = await repo.create({
      customerId: 'cust1',
      productId: 'prod1',
      amount: 100,
      status: TransactionStatus.PENDING,
    });

    expect(transaction.id).toBeDefined();
    expect(transaction.customerId).toBe('cust1');
    expect(transaction.status).toBe(TransactionStatus.PENDING);
  });

  it('should find transaction by id', async () => {
    const created = await repo.create({
      customerId: 'cust1',
      productId: 'prod1',
      amount: 100,
      status: TransactionStatus.PENDING,
    });

    const found = await repo.findById(created.id);
    expect(found).toEqual(created);
  });

  it('should update status', async () => {
    const created = await repo.create({
      customerId: 'cust1',
      productId: 'prod1',
      amount: 100,
      status: TransactionStatus.PENDING,
    });

    await repo.updateStatus(created.id, TransactionStatus.APPROVED);
    const updated = await repo.findById(created.id);
    expect(updated?.status).toBe(TransactionStatus.APPROVED);
  });

  it('should do nothing when updating status of non-existent transaction', async () => {
    await expect(
      repo.updateStatus('non-existent', TransactionStatus.APPROVED),
    ).resolves.toBeUndefined();
  });

  it('should return all transactions', async () => {
    await repo.create({
      customerId: 'cust1',
      productId: 'prod1',
      amount: 100,
      status: TransactionStatus.PENDING,
    });
    await repo.create({
      customerId: 'cust2',
      productId: 'prod2',
      amount: 200,
      status: TransactionStatus.PENDING,
    });

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });
});
