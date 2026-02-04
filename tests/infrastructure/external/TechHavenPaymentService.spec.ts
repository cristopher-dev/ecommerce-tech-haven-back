import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { TechHavenPaymentServiceImpl } from '../../../src/infrastructure/external/TechHavenPaymentServiceImpl';

jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TechHavenPaymentServiceImpl', () => {
  let service: TechHavenPaymentServiceImpl;
  let consoleErrorSpy: jest.SpyInstance;
  let mockHttpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockHttpServiceValue = {
      post: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HttpModule],
      providers: [
        TechHavenPaymentServiceImpl,
        {
          provide: HttpService,
          useValue: mockHttpServiceValue,
        },
      ],
    }).compile();

    service = module.get<TechHavenPaymentServiceImpl>(
      TechHavenPaymentServiceImpl,
    );
    mockHttpService = module.get(HttpService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should process payment successfully', async () => {
    mockHttpService.post
      .mockReturnValueOnce(of({
        data: {
          data: {
            id: 'token123',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }))
      .mockReturnValueOnce(of({
        data: {
          data: {
            status: 'APPROVED',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }));

    const cardData = {
      cardNumber: '4111111111111111',
      expirationMonth: 12,
      expirationYear: 25,
      cvv: '123',
      cardholderName: 'Test User',
    };
    const acceptanceTokens = {
      acceptanceToken: 'acceptance-token',
      personalDataAuthToken: 'personal-data-auth-token',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result).toEqual({ _tag: 'Right', right: 'APPROVED' });
  });

  it('should handle declined payment', async () => {
    mockHttpService.post
      .mockReturnValueOnce(of({
        data: {
          data: {
            id: 'token123',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }))
      .mockReturnValueOnce(of({
        data: {
          data: {
            status: 'DECLINED',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }));

    const cardData = {
      cardNumber: '4111111111111111',
      expirationMonth: 12,
      expirationYear: 25,
      cvv: '123',
      cardholderName: 'Test User',
    };
    const acceptanceTokens = {
      acceptanceToken: 'acceptance-token',
      personalDataAuthToken: 'personal-data-auth-token',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result).toEqual({ _tag: 'Right', right: 'DECLINED' });
  });

  it('should handle pending payment', async () => {
    mockHttpService.post
      .mockReturnValueOnce(of({
        data: {
          data: {
            id: 'token123',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }))
      .mockReturnValueOnce(of({
        data: {
          data: {
            status: 'PENDING',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }));

    const cardData = {
      cardNumber: '4111111111111111',
      expirationMonth: 12,
      expirationYear: 25,
      cvv: '123',
      cardholderName: 'Test User',
    };
    const acceptanceTokens = {
      acceptanceToken: 'acceptance-token',
      personalDataAuthToken: 'personal-data-auth-token',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result).toEqual({ _tag: 'Right', right: 'PENDING' });
  });

  it('should handle API error', async () => {
    mockHttpService.post.mockReturnValueOnce(of({
      data: {
        data: {
          id: 'token123',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    }));

    const cardData = {
      cardNumber: '4111111111111111',
      expirationMonth: 12,
      expirationYear: 25,
      cvv: '123',
      cardholderName: 'Test User',
    };
    const acceptanceTokens = {
      acceptanceToken: 'acceptance-token',
      personalDataAuthToken: 'personal-data-auth-token',
    };
    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result._tag).toBe('Left');
  });
});
