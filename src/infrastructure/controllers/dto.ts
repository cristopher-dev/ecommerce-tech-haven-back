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
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsValidCard,
  IsValidExpiration,
  IsValidCVVFormat,
} from '../utils/CardValidators';

export class TransactionItemInputDto {
  @IsNotEmpty({ message: 'productId should not be empty' })
  @IsString({ message: 'productId must be a string' })
  @ApiProperty({
    description: 'Product ID as string',
    example: 'prod-1',
  })
  productId!: string;

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

export class DeliveryInfoInputDto {
  @IsNotEmpty({ message: 'firstName should not be empty' })
  @IsString({ message: 'firstName must be a string' })
  @MinLength(2, { message: 'firstName must be at least 2 characters long' })
  @ApiProperty({
    description: 'First name for delivery',
    example: 'Juan',
  })
  firstName!: string;

  @IsNotEmpty({ message: 'lastName should not be empty' })
  @IsString({ message: 'lastName must be a string' })
  @MinLength(2, { message: 'lastName must be at least 2 characters long' })
  @ApiProperty({
    description: 'Last name for delivery',
    example: 'Pérez',
  })
  lastName!: string;

  @IsNotEmpty({ message: 'address should not be empty' })
  @IsString({ message: 'address must be a string' })
  @MinLength(5, { message: 'address must be at least 5 characters long' })
  @ApiProperty({
    description: 'Street address for delivery',
    example: 'Calle Principal 123',
  })
  address!: string;

  @IsNotEmpty({ message: 'city should not be empty' })
  @IsString({ message: 'city must be a string' })
  @MinLength(2, { message: 'city must be at least 2 characters long' })
  @ApiProperty({
    description: 'City for delivery',
    example: 'Bogotá',
  })
  city!: string;

  @IsNotEmpty({ message: 'state should not be empty' })
  @IsString({ message: 'state must be a string' })
  @MinLength(2, { message: 'state must be at least 2 characters long' })
  @ApiProperty({
    description: 'State/Province for delivery',
    example: 'Cundinamarca',
  })
  state!: string;

  @IsNotEmpty({ message: 'postalCode should not be empty' })
  @IsString({ message: 'postalCode must be a string' })
  @MinLength(3, { message: 'postalCode must be at least 3 characters long' })
  @ApiProperty({
    description: 'Postal code for delivery',
    example: '110111',
  })
  postalCode!: string;

  @IsNotEmpty({ message: 'phone should not be empty' })
  @IsString({ message: 'phone must be a string' })
  @ApiProperty({
    description: 'Phone number for delivery',
    example: '+573001234567',
  })
  phone!: string;
}

export class CreateTransactionInputDto {
  @IsNotEmpty({ message: 'customerName should not be empty' })
  @IsString({ message: 'customerName must be a string' })
  @MinLength(2, { message: 'customerName must be at least 2 characters long' })
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'Juan Pérez',
    minLength: 2,
  })
  customerName!: string;

  @IsNotEmpty({ message: 'customerEmail should not be empty' })
  @IsEmail({}, { message: 'customerEmail must be a valid email address' })
  @ApiProperty({
    description: 'Email address of the customer',
    example: 'juan@example.com',
  })
  customerEmail!: string;

  @IsNotEmpty({ message: 'customerAddress should not be empty' })
  @IsString({ message: 'customerAddress must be a string' })
  @MinLength(5, {
    message: 'customerAddress must be at least 5 characters long',
  })
  @ApiProperty({
    description:
      'Complete address of the customer (for backwards compatibility)',
    example: 'Calle Principal 123, Bogotá, Cundinamarca 110111',
    minLength: 5,
  })
  customerAddress!: string;

  @IsNotEmpty({ message: 'deliveryInfo should not be empty' })
  @ValidateNested()
  @Type(() => DeliveryInfoInputDto)
  @ApiProperty({
    description: 'Delivery information',
    type: DeliveryInfoInputDto,
  })
  deliveryInfo!: DeliveryInfoInputDto;

  @IsNotEmpty({ message: 'items should not be empty' })
  @IsArray({ message: 'items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TransactionItemInputDto)
  @Min(1, { message: 'items array cannot be empty' })
  @ApiProperty({
    description: 'Array of items in the transaction',
    type: [TransactionItemInputDto],
    example: [
      { productId: 'prod-1', quantity: 1 },
      { productId: 'prod-3', quantity: 1 },
    ],
  })
  items!: TransactionItemInputDto[];
}

export class TransactionItemResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod-1',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Laptop Gaming Pro',
  })
  name!: string;

  @ApiProperty({
    description: 'Product price per unit',
    example: 25.0,
  })
  price!: number;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 1,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Total for this item',
    example: 25.0,
  })
  total!: number;
}

export class DeliveryInfoResponseDto {
  @ApiProperty({ example: 'Juan' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  lastName!: string;

  @ApiProperty({ example: 'Calle Principal 123' })
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  state!: string;

  @ApiProperty({ example: '110111' })
  postalCode!: string;

  @ApiProperty({ example: '+573001234567' })
  phone!: string;
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
    example: 186.99,
  })
  amount!: number;

  @ApiProperty({
    description: 'Current status of the transaction',
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Base fee',
    example: 50.0,
  })
  baseFee!: number;

  @ApiProperty({
    description: 'Delivery fee',
    example: 100.0,
  })
  deliveryFee!: number;

  @ApiProperty({
    description: 'Subtotal for items',
    example: 36.99,
  })
  subtotal!: number;

  @ApiProperty({
    description: 'Customer information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cust-123' },
      name: { type: 'string', example: 'Juan Pérez' },
      email: { type: 'string', example: 'juan@example.com' },
      address: {
        type: 'string',
        example: 'Calle Principal 123, Bogotá, Cundinamarca 110111',
      },
    },
  })
  customer!: { id: string; name: string; email: string; address: string };

  @ApiProperty({
    description: 'Array of items in the transaction',
    type: [TransactionItemResponseDto],
  })
  items!: TransactionItemResponseDto[];

  @ApiProperty({
    description: 'Delivery information',
    type: DeliveryInfoResponseDto,
  })
  deliveryInfo!: DeliveryInfoResponseDto;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-01-30T12:34:56Z',
  })
  createdAt!: string;
}

export class ProcessPaymentResponseDto {
  @ApiProperty({
    description: 'Indicates if payment was processed successfully',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Internal transaction ID',
    example: 'txn-123',
  })
  id!: string;

  @ApiProperty({
    description: 'Customer ID',
    example: 'cust-456',
  })
  customerId!: string;

  @ApiProperty({
    description: 'Total amount',
    example: 186.99,
  })
  amount!: number;

  @ApiProperty({
    description: 'Transaction status',
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
    example: 'APPROVED',
  })
  status!: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN-20250130-001',
  })
  transactionId!: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'ORD-20250130-001',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Items in the transaction',
    type: [TransactionItemResponseDto],
  })
  items!: TransactionItemResponseDto[];

  @ApiProperty({
    description: 'Customer details',
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Juan Pérez' },
      email: { type: 'string', example: 'juan@example.com' },
    },
  })
  customer!: { name: string; email: string };

  @ApiProperty({
    description: 'Delivery assignment info',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'del-123' },
      estimatedDays: { type: 'number', example: 3 },
      carrier: { type: 'string', example: 'DHL' },
    },
  })
  deliveryAssigned!: { id: string; estimatedDays: number; carrier: string };

  @ApiProperty({
    description: 'Last 4 digits of card used',
    example: '0366',
  })
  cardLastFour!: string;

  @ApiProperty({
    description: 'Timestamp when payment was approved',
    example: '2025-01-30T12:34:56Z',
  })
  approvedAt!: string;
}

export class GetTransactionResponseDto {
  @ApiProperty({
    description: 'Indicates if retrieval was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Internal transaction ID',
    example: 'txn-123',
  })
  id!: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN-20250130-001',
  })
  transactionId!: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'ORD-20250130-001',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
    example: 'APPROVED',
  })
  status!: string;

  @ApiProperty({
    description: 'Total amount',
    example: 186.99,
  })
  amount!: number;

  @ApiProperty({
    description: 'Items in the transaction',
    type: [TransactionItemResponseDto],
  })
  items!: TransactionItemResponseDto[];

  @ApiProperty({
    description: 'Customer details',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cust-123' },
      name: { type: 'string', example: 'Juan Pérez' },
      email: { type: 'string', example: 'juan@example.com' },
    },
  })
  customer!: { id: string; name: string; email: string };

  @ApiProperty({
    description: 'Delivery information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'del-123' },
      status: {
        type: 'string',
        enum: ['PENDING', 'ASSIGNED', 'SHIPPED', 'DELIVERED'],
        example: 'PENDING',
      },
      estimatedDays: { type: 'number', example: 3 },
      carrier: { type: 'string', example: 'DHL' },
    },
  })
  delivery!: {
    id: string;
    status: string;
    estimatedDays: number;
    carrier: string;
  };

  @ApiProperty({
    description: 'Transaction timeline',
    type: 'object',
    properties: {
      createdAt: { type: 'string', example: '2025-01-30T10:00:00Z' },
      approvedAt: { type: 'string', example: '2025-01-30T10:05:00Z' },
      deliveryAssignedAt: { type: 'string', example: '2025-01-30T10:06:00Z' },
    },
  })
  timeline!: {
    createdAt: string;
    approvedAt?: string;
    deliveryAssignedAt?: string;
  };
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
  @IsValidCard()
  @ApiProperty({
    description: 'Credit card number',
    example: '4532015112830366',
  })
  cardNumber!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  @ApiProperty({
    description: 'Expiration month (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  expirationMonth!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(2025)
  @IsValidExpiration()
  @ApiProperty({
    description: 'Expiration year (YYYY format)',
    example: 2026,
    minimum: 2025,
  })
  expirationYear!: number;

  @IsNotEmpty()
  @Length(3, 4)
  @IsValidCVVFormat()
  @ApiProperty({
    description: 'CVV (3-4 digits)',
    example: '123',
    minLength: 3,
    maxLength: 4,
  })
  cvv!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @ApiProperty({
    description: 'Card holder name',
    example: 'Juan Perez',
    minLength: 2,
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
