import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRepository } from '../../../domain/repositories/DeliveryRepository';
import { Delivery, DeliveryStatus } from '../../../domain/entities/Delivery';
import { DeliveryEntity } from '../entities/DeliveryEntity';

@Injectable()
export class DeliveryRepositoryImpl implements DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  async create(
    deliveryData: Omit<Delivery, 'id' | 'createdAt'>,
  ): Promise<Delivery> {
    const entity = this.deliveryRepository.create({
      id: crypto.randomUUID(),
      transactionId: deliveryData.transactionId,
      customerId: deliveryData.customerId,
      status: deliveryData.status,
    });

    const savedEntity = await this.deliveryRepository.save(entity);
    return new Delivery(
      savedEntity.id,
      savedEntity.transactionId,
      savedEntity.customerId,
      savedEntity.status,
      savedEntity.createdAt,
    );
  }

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.deliveryRepository.findOne({ where: { id } });
    if (!entity) return null;

    return new Delivery(
      entity.id,
      entity.transactionId,
      entity.customerId,
      entity.status,
      entity.createdAt,
    );
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<void> {
    await this.deliveryRepository.update(id, { status });
  }

  async findAll(): Promise<Delivery[]> {
    const entities = await this.deliveryRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(
      (entity) =>
        new Delivery(
          entity.id,
          entity.transactionId,
          entity.customerId,
          entity.status,
          entity.createdAt,
        ),
    );
  }
}
