import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsUUID,
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
  @IsUUID()
  @ApiProperty({
    description: 'ID of the product',
    example: 'product-uuid-456',
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

export class CardDataDto {
  @IsNotEmpty()
  @Length(13, 19)
  @ApiProperty({
    description: 'Credit card number (fake data)',
    example: '4111111111111111',
  })
  number!: string;

  @IsNotEmpty()
  @Length(2, 2)
  @ApiProperty({
    description: 'Expiration month',
    example: '12',
  })
  expMonth!: string;

  @IsNotEmpty()
  @Length(2, 2)
  @ApiProperty({
    description: 'Expiration year',
    example: '25',
  })
  expYear!: string;

  @IsNotEmpty()
  @Length(3, 4)
  @ApiProperty({
    description: 'CVV',
    example: '123',
  })
  cvc!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe',
  })
  cardHolder!: string;
}
