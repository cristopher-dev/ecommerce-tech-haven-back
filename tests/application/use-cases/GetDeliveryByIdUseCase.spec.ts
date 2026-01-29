import { Test, TestingModule } from '@nestjs/testing';
import { GetDeliveryByIdUseCase } from '../../../src/application/use-cases/GetDeliveryByIdUseCase';
import { DeliveryRepository } from '../../../src/domain/repositories/DeliveryRepository';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';

describe('GetDeliveryByIdUseCase', () => {
  let useCase: GetDeliveryByIdUseCase;
  let mockDeliveryRepository: jest.Mocked<DeliveryRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDeliveryByIdUseCase,
        {
          provide: 'DeliveryRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetDeliveryByIdUseCase>(GetDeliveryByIdUseCase);
    mockDeliveryRepository = module.get('DeliveryRepository');
  });

  it('should return delivery when found', async () => {
    const delivery = new Delivery(
      '1',
      'txn-1',
      'cust-1',
      DeliveryStatus.PENDING,
      new Date(),
    );
    mockDeliveryRepository.findById.mockResolvedValue(delivery);

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(delivery);
    expect(mockDeliveryRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return error when delivery not found', async () => {
    mockDeliveryRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('999');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toContain('not found');
  });

  it('should return error when repository fails', async () => {
    mockDeliveryRepository.findById.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
