import { Injectable, Inject } from '@nestjs/common';
import { Either, right, left } from 'fp-ts/lib/Either';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request: LoginRequest): Promise<Either<Error, LoginResponse>> {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(request.email);

      if (!user) {
        return left(new Error('Usuario o contraseña inválidos'));
      }

      // Validar contraseña
      const isPasswordValid = await bcrypt.compare(
        request.password,
        user.password,
      );

      if (!isPasswordValid) {
        return left(new Error('Usuario o contraseña inválidos'));
      }

      // Generar JWT token
      const token: string = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return right({
        token,
        user,
      });
    } catch (error) {
      return left(
        error instanceof Error ? error : new Error('Error desconocido'),
      );
    }
  }
}
