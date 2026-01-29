import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Delivery } from '../../domain/entities/Delivery';
import type { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';

@Injectable()
export class GetDeliveryByIdUseCase {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(id: string): Promise<Either<Error, Delivery>> {
    try {
      const delivery = await this.deliveryRepository.findById(id);
      if (!delivery) {
        return left(new Error(`Delivery with id ${id} not found`));
      }
      return right(delivery);
    } catch (error) {
      return left(error as Error);
    }
  }
}
