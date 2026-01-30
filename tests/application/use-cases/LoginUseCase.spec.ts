import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginUseCase } from '../../../src/application/use-cases/LoginUseCase';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';
import { User, UserRole } from '../../../src/domain/entities/User';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUser = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: 'UserRepository', useValue: mockUser },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    mockUserRepo = module.get('UserRepository');
    mockJwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return Right with token and user on successful login', async () => {
      // Arrange
      const email = 'admin@techhaven.com';
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create('user-1', email, hashedPassword, UserRole.ADMIN);
      const token = 'jwt-token-example';

      mockUserRepo.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result._tag).toBe('Right');
      expect((result as any).right.token).toBe(token);
      expect((result as any).right.user).toEqual(user);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('should return Left with error when user not found', async () => {
      // Arrange
      const email = 'nonexistent@techhaven.com';
      const password = 'password123';

      mockUserRepo.findByEmail.mockResolvedValue(null);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result._tag).toBe('Left');
      expect((result as any).left.message).toBe(
        'Usuario o contraseña inválidos',
      );
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return Left with error when password is invalid', async () => {
      // Arrange
      const email = 'admin@techhaven.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = User.create('user-1', email, hashedPassword, UserRole.ADMIN);

      mockUserRepo.findByEmail.mockResolvedValue(user);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result._tag).toBe('Left');
      expect((result as any).left.message).toBe(
        'Usuario o contraseña inválidos',
      );
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return Left with error on repository exception', async () => {
      // Arrange
      const email = 'admin@techhaven.com';
      const password = 'admin123';
      const error = new Error('Database connection failed');

      mockUserRepo.findByEmail.mockRejectedValue(error);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result._tag).toBe('Left');
      expect((result as any).left.message).toBe('Database connection failed');
    });

    it('should return Right for customer role login', async () => {
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

      mockUserRepo.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result._tag).toBe('Right');
      expect((result as any).right.user.role).toBe(UserRole.CUSTOMER);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: UserRole.CUSTOMER,
      });
    });
  });
});
