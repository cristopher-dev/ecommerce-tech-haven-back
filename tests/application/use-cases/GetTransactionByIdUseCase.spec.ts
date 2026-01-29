import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionByIdUseCase } from '../../../src/application/use-cases/GetTransactionByIdUseCase';
import { TransactionRepository } from '../../../src/domain/repositories/TransactionRepository';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';

describe('GetTransactionByIdUseCase', () => {
  let useCase: GetTransactionByIdUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionByIdUseCase,
        {
          provide: 'TransactionRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionByIdUseCase>(GetTransactionByIdUseCase);
    mockTransactionRepository = module.get('TransactionRepository');
  });

  it('should return transaction when found', async () => {
    const transaction = new Transaction(
      '1',
      'cust-1',
      'prod-1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(transaction);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return error when transaction not found', async () => {
    mockTransactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('999');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toContain('not found');
  });

  it('should return error when repository fails', async () => {
    mockTransactionRepository.findById.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute('1');

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
