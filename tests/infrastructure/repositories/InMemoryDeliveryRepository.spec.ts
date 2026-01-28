import { InMemoryDeliveryRepository } from '../../../src/infrastructure/repositories/InMemoryDeliveryRepository';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('InMemoryDeliveryRepository', () => {
  let repo: InMemoryDeliveryRepository;

  beforeEach(() => {
    repo = new InMemoryDeliveryRepository();
  });

  it('should create delivery', async () => {
    const delivery = await repo.create({
      transactionId: 'trans1',
      customerId: 'cust1',
      status: DeliveryStatus.PENDING,
    });

    expect(delivery.id).toBe('mock-uuid');
    expect(delivery.transactionId).toBe('trans1');
  });

  it('should update status', async () => {
    const created = await repo.create({
      transactionId: 'trans1',
      customerId: 'cust1',
      status: DeliveryStatus.PENDING,
    });

    await repo.updateStatus(created.id, DeliveryStatus.SHIPPED);
    const found = await repo.findById(created.id);
    expect(found?.status).toBe(DeliveryStatus.SHIPPED);
  });

  it('should do nothing when updating non-existent delivery', async () => {
    await expect(
      repo.updateStatus('non-existent', DeliveryStatus.SHIPPED),
    ).resolves.toBeUndefined();
  });

  it('should return all deliveries', async () => {
    await repo.create({
      transactionId: 'trans1',
      customerId: 'cust1',
      status: DeliveryStatus.PENDING,
    });

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
  });
});
