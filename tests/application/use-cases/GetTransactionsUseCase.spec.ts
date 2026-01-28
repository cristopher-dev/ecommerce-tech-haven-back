import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionsUseCase } from '../../../src/application/use-cases/GetTransactionsUseCase';
import { TransactionRepository } from '../../../src/domain/repositories/TransactionRepository';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';

describe('GetTransactionsUseCase', () => {
  let useCase: GetTransactionsUseCase;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    const mockTransactionRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsUseCase,
        {
          provide: 'TransactionRepository',
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionsUseCase>(GetTransactionsUseCase);
    transactionRepository = module.get('TransactionRepository');
  });

  it('should return all transactions', async () => {
    const transactions: Transaction[] = [
      new Transaction(
        '1',
        'cust1',
        'prod1',
        100,
        TransactionStatus.PENDING,
        new Date(),
        new Date(),
      ),
      new Transaction(
        '2',
        'cust2',
        'prod2',
        200,
        TransactionStatus.APPROVED,
        new Date(),
        new Date(),
      ),
    ];
    transactionRepository.findAll.mockResolvedValue(transactions);

    const result = await useCase.execute();

    expect(transactionRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Right', right: transactions });
  });

  it('should return empty array when no transactions', async () => {
    transactionRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(transactionRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Right', right: [] });
  });

  it('should return error when repository throws', async () => {
    const error = new Error('Database error');
    transactionRepository.findAll.mockRejectedValue(error);

    const result = await useCase.execute();

    expect(transactionRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({ _tag: 'Left', left: error });
  });
});
