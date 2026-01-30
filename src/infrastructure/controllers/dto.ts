import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Min,
  Max,
  Length,
  IsInt,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateTransactionInputDto {
  @IsNotEmpty({ message: 'customerName should not be empty' })
  @IsString({ message: 'customerName must be a string' })
  @MinLength(2, { message: 'customerName must be at least 2 characters long' })
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'María López',
    minLength: 2,
  })
  customerName!: string;

  @IsNotEmpty({ message: 'customerEmail should not be empty' })
  @IsEmail({}, { message: 'customerEmail must be a valid email address' })
  @ApiProperty({
    description: 'Email address of the customer',
    example: 'maria@example.com',
  })
  customerEmail!: string;

  @IsNotEmpty({ message: 'customerAddress should not be empty' })
  @IsString({ message: 'customerAddress must be a string' })
  @MinLength(5, {
    message: 'customerAddress must be at least 5 characters long',
  })
  @ApiProperty({
    description: 'Complete address of the customer',
    example: 'Calle secundaria 456, Medellín, Antioquia 050001',
    minLength: 5,
  })
  customerAddress!: string;

  @IsNotEmpty({ message: 'productId should not be empty' })
  @ApiProperty({
    description: 'Product ID - can be string or number',
    example: '1',
    oneOf: [
      { type: 'string', example: '1' },
      { type: 'number', example: 1 },
    ],
  })
  productId!: string | number;

  @IsNotEmpty({ message: 'quantity should not be empty' })
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @Max(10, { message: 'quantity cannot exceed 10' })
  @ApiProperty({
    description: 'Quantity of the product to order',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  quantity!: number;
}

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Indicates if the transaction was created successfully',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Unique transaction identifier',
    example: 'TXN-20250130-001',
  })
  transactionId!: string;

  @ApiProperty({
    description: 'Order tracking ID',
    example: 'ORD-20250130-001',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Total amount charged for the transaction',
    example: 175.0,
  })
  amount!: number;

  @ApiProperty({
    description: 'Current status of the transaction',
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Customer information',
    type: 'object',
    properties: {
      name: { type: 'string', example: 'María López' },
      email: { type: 'string', example: 'maria@example.com' },
    },
  })
  customer?: { name: string; email: string };

  @ApiProperty({
    description: 'Product information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Laptop Gaming Pro' },
    },
  })
  product?: { id: number; name: string };

  @ApiProperty({
    description: 'Ordered quantity',
    example: 1,
  })
  quantity?: number;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-01-30T12:34:56Z',
  })
  createdAt?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Optional error message if transaction creation failed',
    example: 'Product not found',
  })
  message?: string;
}

export class CreateCustomerInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the customer',
    example: 'John Doe',
  })
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
  })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, City, Country',
  })
  address!: string;
}
export class CardDataDto {
  @IsNotEmpty()
  @Length(13, 19)
  @ApiProperty({
    description: 'Credit card number (fake data)',
    example: '4111111111111111',
  })
  cardNumber!: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'Expiration month',
    example: 12,
  })
  expirationMonth!: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'Expiration year',
    example: 2026,
  })
  expirationYear!: number;

  @IsNotEmpty()
  @Length(3, 4)
  @ApiProperty({
    description: 'CVV',
    example: '123',
  })
  cvv!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe',
  })
  cardholderName!: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'admin@techhaven.com',
  })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'User email',
    example: 'admin@techhaven.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User role',
    example: 'ADMIN',
  })
  role!: string;
}
