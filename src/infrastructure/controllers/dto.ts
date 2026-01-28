import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionInputDto {
  @ApiProperty({
    description: 'Name of the customer',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, City, Country',
  })
  customerAddress: string;

  @ApiProperty({
    description: 'ID of the product',
    example: 'product-uuid-456',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 1,
  })
  quantity: number;
}

export class CardDataDto {
  @ApiProperty({
    description: 'Credit card number (fake data)',
    example: '4111111111111111',
  })
  number: string;

  @ApiProperty({
    description: 'Expiration month',
    example: '12',
  })
  expMonth: string;

  @ApiProperty({
    description: 'Expiration year',
    example: '25',
  })
  expYear: string;

  @ApiProperty({
    description: 'CVV',
    example: '123',
  })
  cvc: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe',
  })
  cardHolder: string;
}
