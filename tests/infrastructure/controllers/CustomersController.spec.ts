import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from '../../../src/infrastructure/controllers/CustomersController';
import { GetCustomersUseCase } from '../../../src/application/use-cases/GetCustomersUseCase';
import { Customer } from '../../../src/domain/entities/Customer';

describe('CustomersController', () => {
  let controller: CustomersController;
  let getCustomersUseCase: jest.Mocked<GetCustomersUseCase>;

  beforeEach(async () => {
    const mockGetCustomersUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: GetCustomersUseCase,
          useValue: mockGetCustomersUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    getCustomersUseCase = module.get(GetCustomersUseCase);
  });

  it('should return all customers', async () => {
    const customers: Customer[] = [
      new Customer('1', 'John Doe', 'john@example.com', '123 Main St'),
      new Customer('2', 'Jane Doe', 'jane@example.com', '456 Elm St'),
    ];
    getCustomersUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: customers,
    });

    const result = await controller.getCustomers();

    expect(getCustomersUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual(customers);
  });

  it('should throw error on get customers failure', async () => {
    getCustomersUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Database error'),
    });

    await expect(controller.getCustomers()).rejects.toThrow('Database error');
  });
});
