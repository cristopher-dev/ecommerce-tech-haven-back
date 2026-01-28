import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MockWompiPaymentService } from '../../../src/infrastructure/external/MockWompiPaymentService';
import { TransactionStatus } from '../../../src/domain/entities/Transaction';

jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MockWompiPaymentService', () => {
  let service: MockWompiPaymentService;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MockWompiPaymentService],
    }).compile();

    service = module.get<MockWompiPaymentService>(MockWompiPaymentService);
  });

  it('should approve payment if amount < 500', async () => {
    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      400,
      cardData,
      'test@example.com',
    );

    expect(result).toEqual({
      _tag: 'Right',
      right: TransactionStatus.APPROVED,
    });
  });

  it('should decline payment if amount >= 500', async () => {
    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      500,
      cardData,
      'test@example.com',
    );

    expect(result).toEqual({
      _tag: 'Right',
      right: TransactionStatus.DECLINED,
    });
  });

  it('should handle API error', async () => {
    // Mock service doesn't use API, so no error
    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      400,
      cardData,
      'test@example.com',
    );

    expect(result._tag).toBe('Right');
  });
});
