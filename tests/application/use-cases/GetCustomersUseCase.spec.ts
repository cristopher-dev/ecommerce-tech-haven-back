import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomersUseCase } from '../../../src/application/use-cases/GetCustomersUseCase';
import { CustomerRepository } from '../../../src/domain/repositories/CustomerRepository';
import { Customer } from '../../../src/domain/entities/Customer';

describe('GetCustomersUseCase', () => {
  let useCase: GetCustomersUseCase;
  let customerRepository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const mockCustomerRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomersUseCase,
        {
          provide: 'CustomerRepository',
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomersUseCase>(GetCustomersUseCase);
    customerRepository = module.get('CustomerRepository');
  });

  it('should return all customers', async () => {
    const customers: Customer[] = [
      new Customer('1', 'John Doe', 'john@example.com', '123 Main St'),
      new Customer('2', 'Jane Doe', 'jane@example.com', '456 Elm St'),
    ];
    customerRepository.findAll.mockResolvedValue(customers);

    const result = await useCase.execute();

    expect(result).toEqual({ _tag: 'Right', right: customers });
  });

  it('should return empty array when no customers', async () => {
    customerRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(customerRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Right', right: [] });
  });

  it('should return error when repository throws', async () => {
    const error = new Error('Database error');
    customerRepository.findAll.mockRejectedValue(error);

    const result = await useCase.execute();

    expect(customerRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Left', left: error });
  });
});
