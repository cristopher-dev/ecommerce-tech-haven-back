import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { WompiPaymentServiceImpl } from '../../../src/infrastructure/external/WompiPaymentServiceImpl';

jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiPaymentServiceImpl', () => {
  let service: WompiPaymentServiceImpl;

  beforeEach(async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          id: 'token123',
        },
      },
    });
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

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [WompiPaymentServiceImpl],
    }).compile();

    service = module.get<WompiPaymentServiceImpl>(WompiPaymentServiceImpl);
  });

  it('should process payment successfully', async () => {
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
});
