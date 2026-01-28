import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Delivery } from '../../domain/entities/Delivery';
import type { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';

@Injectable()
export class GetDeliveriesUseCase {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(): Promise<Either<Error, Delivery[]>> {
    try {
      const deliveries = await this.deliveryRepository.findAll();
      return right(deliveries);
    } catch (error) {
      return left(error as Error);
    }
  }
}
