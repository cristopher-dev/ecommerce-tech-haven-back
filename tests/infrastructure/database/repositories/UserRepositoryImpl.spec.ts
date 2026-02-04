import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepositoryImpl } from '../../../../src/infrastructure/database/repositories/UserRepositoryImpl';
import { UserEntity } from '../../../../src/infrastructure/database/entities/UserEntity';
import { User, UserRole } from '../../../../src/domain/entities/User';

describe('UserRepositoryImpl', () => {
  let service: UserRepositoryImpl;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryImpl,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserRepositoryImpl>(UserRepositoryImpl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'hashedPassword',
      UserRole.CUSTOMER,
      new Date(),
    );
    const userEntity = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
    };

    mockRepository.create.mockReturnValue(userEntity);
    mockRepository.save.mockResolvedValue(userEntity);

    const result = await service.create(user);
    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should find user by id', async () => {
    const userEntity = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(userEntity);

    const result = await service.findById('1');
    expect(result).toBeDefined();
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return null when user not found by id', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const result = await service.findById('non-existent');
    expect(result).toBeNull();
  });

  it('should find user by email', async () => {
    const userEntity = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(userEntity);

    const result = await service.findByEmail('test@example.com');
    expect(result).toBeDefined();
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
  });

  it('should find all users', async () => {
    const userEntities = [
      {
        id: '1',
        email: 'test1@example.com',
        password: 'hashedPassword',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      },
      {
        id: '2',
        email: 'test2@example.com',
        password: 'hashedPassword',
        role: UserRole.ADMIN,
        createdAt: new Date(),
      },
    ];

    mockRepository.find.mockResolvedValue(userEntities);

    const result = await service.findAll();
    expect(result).toHaveLength(2);
    expect(mockRepository.find).toHaveBeenCalled();
  });
});
