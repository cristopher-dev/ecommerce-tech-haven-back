import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from '../../../src/infrastructure/controllers/DeliveriesController';
import { GetDeliveriesUseCase } from '../../../src/application/use-cases/GetDeliveriesUseCase';
import { GetDeliveryByIdUseCase } from '../../../src/application/use-cases/GetDeliveryByIdUseCase';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let getDeliveriesUseCase: jest.Mocked<GetDeliveriesUseCase>;
  let getDeliveryByIdUseCase: jest.Mocked<GetDeliveryByIdUseCase>;

  beforeEach(async () => {
    const mockGetDeliveriesUseCase = {
      execute: jest.fn(),
    };
    const mockGetDeliveryByIdUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        {
          provide: GetDeliveriesUseCase,
          useValue: mockGetDeliveriesUseCase,
        },
        {
          provide: GetDeliveryByIdUseCase,
          useValue: mockGetDeliveryByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
    getDeliveriesUseCase = module.get(GetDeliveriesUseCase);
    getDeliveryByIdUseCase = module.get(GetDeliveryByIdUseCase);
  });

  it('should return all deliveries', async () => {
    const deliveries: Delivery[] = [
      new Delivery('1', 'trans1', 'cust1', DeliveryStatus.PENDING, new Date()),
      new Delivery(
        '2',
        'trans2',
        'cust2',
        DeliveryStatus.DELIVERED,
        new Date(),
      ),
    ];
    getDeliveriesUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: deliveries,
    });

    const result = await controller.getDeliveries();

    expect(getDeliveriesUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual(deliveries);
  });

  it('should throw error on get deliveries failure', async () => {
    getDeliveriesUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Database error'),
    });

    await expect(controller.getDeliveries()).rejects.toThrow('Database error');
  });
});
