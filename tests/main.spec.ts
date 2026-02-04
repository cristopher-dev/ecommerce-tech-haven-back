import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { bootstrap } from '../src/main';

jest.mock('@nestjs/core');
jest.mock('../src/app.module', () => ({
  AppModule: class MockAppModule {},
}));
jest.mock('@nestjs/swagger', () => ({
  ApiTags: jest.fn(),
  ApiOperation: jest.fn(),
  ApiResponse: jest.fn(),
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

jest.mock('helmet');

describe('main - bootstrap', () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:3000'),
      getHttpAdapter: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn().mockReturnThis(),
      setGlobalPrefix: jest.fn().mockReturnThis(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});
    (SwaggerModule.setup as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should bootstrap the application', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      expect.any(Object),
      {
        swaggerOptions: {
          persistAuthorization: true,
        },
      },
    );
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
    expect(mockApp.getUrl).toHaveBeenCalled();
  });

  it('should use PORT from env if set', async () => {
    process.env.PORT = '4000';
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
    delete process.env.PORT;
  });
});
