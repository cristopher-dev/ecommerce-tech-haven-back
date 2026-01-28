import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from '../../../src/infrastructure/controllers/DeliveriesController';
import { GetDeliveriesUseCase } from '../../../src/application/use-cases/GetDeliveriesUseCase';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let getDeliveriesUseCase: jest.Mocked<GetDeliveriesUseCase>;

  beforeEach(async () => {
    const mockGetDeliveriesUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        {
          provide: GetDeliveriesUseCase,
          useValue: mockGetDeliveriesUseCase,
        },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
    getDeliveriesUseCase = module.get(GetDeliveriesUseCase);
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
    getDeliveriesUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: deliveries,
    });

    const result = await controller.getDeliveries();

    expect(getDeliveriesUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual(deliveries);
  });
});
