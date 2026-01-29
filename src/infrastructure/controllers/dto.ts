import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Min,
  Max,
  Length,
  IsInt,
} from 'class-validator';

export class CreateTransactionInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the customer',
    example: 'John Doe',
  })
  customerName!: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
  })
  customerEmail!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, City, Country',
  })
  customerAddress!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the product',
    example: 'prod-1',
  })
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @ApiProperty({
    description: 'Quantity of the product',
    example: 1,
  })
  quantity!: number;
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
