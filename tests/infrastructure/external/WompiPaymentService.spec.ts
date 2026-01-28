import { Test, TestingModule } from '@nestjs/testing';
import { MockWompiPaymentService } from '../../../src/infrastructure/external/MockWompiPaymentService';

describe('MockWompiPaymentService', () => {
  let service: MockWompiPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
