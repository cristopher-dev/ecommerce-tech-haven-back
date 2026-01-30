import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserEntity } from '../entities/UserEntity';
import { randomUUID } from 'crypto';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const userEntity = this.repository.create({
      id: user.id || randomUUID(),
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    });

    const saved = await this.repository.save(userEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.repository.find();
    return userEntities.map((ue) => this.toDomain(ue));
  }

  async update(user: User): Promise<User> {
    const userEntity = this.repository.create({
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    });

    const updated = await this.repository.save(userEntity);
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(userEntity: UserEntity): User {
    return User.create(
      userEntity.id,
      userEntity.email,
      userEntity.password,
      userEntity.role as UserRole,
      userEntity.createdAt,
    );
  }
}
