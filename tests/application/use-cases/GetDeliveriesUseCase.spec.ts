import { Test, TestingModule } from '@nestjs/testing';
import { GetDeliveriesUseCase } from '../../../src/application/use-cases/GetDeliveriesUseCase';
import { DeliveryRepository } from '../../../src/domain/repositories/DeliveryRepository';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';

describe('GetDeliveriesUseCase', () => {
  let useCase: GetDeliveriesUseCase;
  let deliveryRepository: jest.Mocked<DeliveryRepository>;

  beforeEach(async () => {
    const mockDeliveryRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDeliveriesUseCase,
        {
          provide: 'DeliveryRepository',
          useValue: mockDeliveryRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetDeliveriesUseCase>(GetDeliveriesUseCase);
    deliveryRepository = module.get('DeliveryRepository');
  });

  it('should return all deliveries', async () => {
    const deliveries: Delivery[] = [
      new Delivery('1', 'trans1', 'cust1', DeliveryStatus.PENDING, new Date()),
      new Delivery(
        '2',
        'trans2',
        'cust2',
        DeliveryStatus.COMPLETED,
        new Date(),
      ),
    ];
    deliveryRepository.findAll.mockResolvedValue(deliveries);

    const result = await useCase.execute();

    expect(result).toEqual({ _tag: 'Right', right: deliveries });
  });

  it('should return empty array when no deliveries', async () => {
    deliveryRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(deliveryRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Right', right: [] });
  });

  it('should return error when repository throws', async () => {
    const error = new Error('Database error');
    deliveryRepository.findAll.mockRejectedValue(error);

    const result = await useCase.execute();

    expect(deliveryRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Left', left: error });
  });
});
