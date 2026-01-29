import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerByIdUseCase } from '../../../src/application/use-cases/GetCustomerByIdUseCase';
import { CustomerRepository } from '../../../src/domain/repositories/CustomerRepository';
import { Customer } from '../../../src/domain/entities/Customer';

describe('GetCustomerByIdUseCase', () => {
  let useCase: GetCustomerByIdUseCase;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerByIdUseCase,
        {
          provide: 'CustomerRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomerByIdUseCase>(GetCustomerByIdUseCase);
    mockCustomerRepository = module.get('CustomerRepository');
  });

  it('should return customer when found', async () => {
    const customer = new Customer(
      '1',
      'John Doe',
      'john@example.com',
      '123 Main St',
    );
    mockCustomerRepository.findById.mockResolvedValue(customer);

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(customer);
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return error when customer not found', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('999');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toContain('not found');
  });

  it('should return error when repository fails', async () => {
    mockCustomerRepository.findById.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
