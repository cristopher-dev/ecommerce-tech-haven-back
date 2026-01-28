import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MockWompiPaymentService } from '../../../src/infrastructure/external/MockWompiPaymentService';

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

  it('should process payment successfully for amount < 500', async () => {
    const result = await service.processPayment('trans1', 100);

    expect(result).toEqual({ _tag: 'Right', right: 'APPROVED' });
  });

  it('should decline payment for amount >= 500', async () => {
    const result = await service.processPayment('trans1', 500);

    expect(result).toEqual({ _tag: 'Right', right: 'DECLINED' });
  });
});
