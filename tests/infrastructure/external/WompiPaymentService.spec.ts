import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { WompiPaymentServiceImpl } from '../../../src/infrastructure/external/WompiPaymentServiceImpl';

jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiPaymentServiceImpl', () => {
  let service: WompiPaymentServiceImpl;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [WompiPaymentServiceImpl],
    }).compile();

    service = module.get<WompiPaymentServiceImpl>(WompiPaymentServiceImpl);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should process payment successfully', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 'token123',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'APPROVED',
          },
        },
      });

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
    );

    expect(result).toEqual({ _tag: 'Right', right: 'APPROVED' });
  });

  it('should handle declined payment', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 'token123',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'DECLINED',
          },
        },
      });

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
    );

    expect(result).toEqual({ _tag: 'Right', right: 'DECLINED' });
  });

  it('should handle pending payment', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 'token123',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            status: 'PENDING',
          },
        },
      });

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
    );

    expect(result).toEqual({ _tag: 'Right', right: 'PENDING' });
  });

  it('should handle API error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API error'));

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
    );

    expect(result._tag).toBe('Left');
  });
});
