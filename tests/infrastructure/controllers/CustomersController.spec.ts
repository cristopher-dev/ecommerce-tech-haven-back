import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from '../../../src/infrastructure/controllers/CustomersController';
import { GetCustomersUseCase } from '../../../src/application/use-cases/GetCustomersUseCase';
import { GetCustomerByIdUseCase } from '../../../src/application/use-cases/GetCustomerByIdUseCase';
import { CreateCustomerUseCase } from '../../../src/application/use-cases/CreateCustomerUseCase';
import { Customer } from '../../../src/domain/entities/Customer';

describe('CustomersController', () => {
  let controller: CustomersController;
  let getCustomersUseCase: jest.Mocked<GetCustomersUseCase>;
  let getCustomerByIdUseCase: jest.Mocked<GetCustomerByIdUseCase>;
  let createCustomerUseCase: jest.Mocked<CreateCustomerUseCase>;

  beforeEach(async () => {
    const mockGetCustomersUseCase = {
      execute: jest.fn(),
    };
    const mockGetCustomerByIdUseCase = {
      execute: jest.fn(),
    };
    const mockCreateCustomerUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: GetCustomersUseCase,
          useValue: mockGetCustomersUseCase,
        },
        {
          provide: GetCustomerByIdUseCase,
          useValue: mockGetCustomerByIdUseCase,
        },
        {
          provide: CreateCustomerUseCase,
          useValue: mockCreateCustomerUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    getCustomersUseCase = module.get(GetCustomersUseCase);
    getCustomerByIdUseCase = module.get(GetCustomerByIdUseCase);
    createCustomerUseCase = module.get(CreateCustomerUseCase);
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
