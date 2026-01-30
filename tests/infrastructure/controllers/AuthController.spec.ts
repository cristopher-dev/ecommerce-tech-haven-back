import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthController } from '../../../src/infrastructure/controllers/AuthController';
import { LoginUseCase } from '../../../src/application/use-cases/LoginUseCase';
import { User, UserRole } from '../../../src/domain/entities/User';

describe('AuthController', () => {
  let controller: AuthController;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    const mockLogin = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: LoginUseCase, useValue: mockLogin }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    mockLoginUseCase = module.get<jest.Mocked<LoginUseCase>>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token and user info on successful login', async () => {
      // Arrange
      const email = 'admin@techhaven.com';
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create('user-1', email, hashedPassword, UserRole.ADMIN);
      const token = 'jwt-token-example';

      mockLoginUseCase.execute.mockResolvedValue({
        _tag: 'Right' as const,
        right: { token, user },
      });

      // Act
      const result = await controller.login({ email, password });

      // Assert
      expect(result.token).toBe(token);
      expect(result.email).toBe(email);
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email,
        password,
      });
    });

    it('should throw error when login fails', async () => {
      // Arrange
      const email = 'invalid@techhaven.com';
      const password = 'wrongpassword';
      const error = new Error('Usuario o contraseña inválidos');

      mockLoginUseCase.execute.mockResolvedValue({
        _tag: 'Left' as const,
        left: error,
      });

      // Act & Assert
      await expect(controller.login({ email, password })).rejects.toThrow(
        'Usuario o contraseña inválidos',
      );
    });

    it('should return customer info on successful customer login', async () => {
      // Arrange
      const email = 'customer@techhaven.com';
      const password = 'customer123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create(
        'user-2',
        email,
        hashedPassword,
        UserRole.CUSTOMER,
      );
      const token = 'jwt-token-customer';

      mockLoginUseCase.execute.mockResolvedValue({
        _tag: 'Right' as const,
        right: { token, user },
      });

      // Act
      const result = await controller.login({ email, password });

      // Assert
      expect(result.token).toBe(token);
      expect(result.email).toBe(email);
      expect(result.role).toBe(UserRole.CUSTOMER);
    });
  });
});
