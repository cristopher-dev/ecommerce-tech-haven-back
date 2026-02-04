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

  it('should return customer by id', async () => {
    const customer = new Customer(
      '1',
      'John Doe',
      'john@example.com',
      '123 Main St',
    );
    getCustomerByIdUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: customer,
    });

    const result = await controller.getCustomerById('1');

    expect(getCustomerByIdUseCase.execute).toHaveBeenCalledWith('1');
    expect(result).toEqual(customer);
  });

  it('should throw error on get customer by id failure', async () => {
    getCustomerByIdUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Customer not found'),
    });

    await expect(controller.getCustomerById('invalid-id')).rejects.toThrow(
      'Customer not found',
    );
  });

  it('should create a new customer', async () => {
    const customerData = {
      name: 'New Customer',
      email: 'new@example.com',
      address: '789 Oak St',
    };
    const createdCustomer = new Customer(
      '3',
      customerData.name,
      customerData.email,
      customerData.address,
    );

    createCustomerUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: createdCustomer,
    });

    const result = await controller.createCustomer(customerData);

    expect(createCustomerUseCase.execute).toHaveBeenCalledWith(customerData);
    expect(result).toEqual(createdCustomer);
  });

  it('should throw error on create customer failure', async () => {
    const customerData = {
      name: 'New Customer',
      email: 'new@example.com',
      address: '789 Oak St',
    };

    createCustomerUseCase.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Validation error'),
    });

    await expect(controller.createCustomer(customerData)).rejects.toThrow(
      'Validation error',
    );
  });

  it('should handle empty customer list', async () => {
    getCustomersUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: [],
    });

    const result = await controller.getCustomers();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle single customer retrieval', async () => {
    const customer = new Customer(
      'single-id',
      'Single Customer',
      'single@example.com',
      'Single St',
    );
    getCustomerByIdUseCase.execute.mockResolvedValue({
      _tag: 'Right',
      right: customer,
    });

    const result = await controller.getCustomerById('single-id');

    expect(result.id).toBe('single-id');
    expect(result.name).toBe('Single Customer');
  });
});
