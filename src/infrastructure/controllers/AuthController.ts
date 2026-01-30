import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { LoginDto, LoginResponseDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Returns JWT token valid for 24h.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
    examples: {
      admin: {
        summary: 'Admin Login',
        value: {
          email: 'admin@techhaven.com',
          password: 'admin123',
        },
      },
      customer: {
        summary: 'Customer Login',
        value: {
          email: 'customer@techhaven.com',
          password: 'customer123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. JWT token returned with user info.',
    type: LoginResponseDto,
    example: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6ImFkbWluQHRlY2hoYXZlbi5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2NzQ0NDQ0NDQsImV4cCI6MTY3NDUzMDg0NH0.abc123xyz',
      email: 'admin@techhaven.com',
      role: 'ADMIN',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    example: {
      statusCode: 401,
      message: 'Usuario o contraseña inválidos',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input format',
    example: {
      statusCode: 400,
      message: ['email must be an email', 'password should not be empty'],
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (result._tag === 'Left') {
      const error = result.left;
      throw new Error(error.message);
    }

    const { token, user } = result.right;

    return {
      token,
      email: user.email,
      role: user.role,
    };
  }
}
