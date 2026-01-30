import 'reflect-metadata';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCustomersUseCase } from '../../application/use-cases/GetCustomersUseCase';
import { GetCustomerByIdUseCase } from '../../application/use-cases/GetCustomerByIdUseCase';
import { CreateCustomerUseCase } from '../../application/use-cases/CreateCustomerUseCase';
import { CreateCustomerInputDto } from './dto';

@ApiTags('Customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all customers',
    description:
      'Retrieve a list of all customers in the system, including their name, email, and address information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    schema: {
      example: [
        {
          id: 'cust-456',
          name: 'John Doe',
          email: 'john.doe@example.com',
          address: '123 Main St, City, Country',
        },
      ],
    },
  })
  async getCustomers() {
    const result = await this.getCustomersUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a customer by ID',
    description: 'Retrieve detailed information about a specific customer.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    schema: {
      example: {
        id: 'cust-456',
        name: 'John Doe',
        email: 'john.doe@example.com',
        address: '123 Main St, City, Country',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('id') id: string) {
    const result = await this.getCustomerByIdUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new customer',
    description:
      'Create a new customer with name, email, and address. Email must be unique in the system.',
  })
  @ApiBody({ type: CreateCustomerInputDto })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        id: 'cust-456',
        name: 'John Doe',
        email: 'john.doe@example.com',
        address: '123 Main St, City, Country',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or email already exists',
  })
  async createCustomer(@Body() input: CreateCustomerInputDto) {
    const result = await this.createCustomerUseCase.execute(input);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
