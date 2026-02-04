import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { TechHavenPaymentServiceImpl } from '../../../src/infrastructure/external/TechHavenPaymentServiceImpl';

describe('TechHavenPaymentServiceImpl', () => {
  let service: TechHavenPaymentServiceImpl;
  let consoleErrorSpy: jest.SpyInstance;
  let mockHttpService: any;

  const mockHttpResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

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

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockHttpServiceValue = {
      post: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process payment successfully', async () => {
    mockHttpService.post
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { id: 'token123' } })),
      )
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { status: 'APPROVED' } })),
      );

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
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { id: 'token123' } })),
      )
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { status: 'DECLINED' } })),
      );

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
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { id: 'token123' } })),
      )
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { status: 'PENDING' } })),
      );

    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result).toEqual({ _tag: 'Right', right: 'PENDING' });
  });

  it('should handle API error on token creation', async () => {
    mockHttpService.post.mockImplementationOnce(() =>
      throwError(() => new Error('API error')),
    );

    const result = await service.processPayment(
      'trans1',
      100,
      cardData,
      'test@example.com',
      acceptanceTokens,
    );

    expect(result._tag).toBe('Left');
  });

  it('should handle API error on payment processing', async () => {
    mockHttpService.post
      .mockImplementationOnce(() =>
        of(mockHttpResponse({ data: { id: 'token123' } })),
      )
      .mockImplementationOnce(() =>
        throwError(() => new Error('Payment processing error')),
      );

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
