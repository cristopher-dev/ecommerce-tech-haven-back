import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Delivery, DeliveryStatus } from '../../domain/entities/Delivery';
import { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';

@Injectable()
export class InMemoryDeliveryRepository implements DeliveryRepository {
  private deliveries: Delivery[] = [];

  async create(data: Omit<Delivery, 'id' | 'createdAt'>): Promise<Delivery> {
    const delivery = new Delivery(
      uuidv4(),
      data.transactionId,
      data.customerId,
      data.status,
      new Date(),
    );
    this.deliveries.push(delivery);
    return Promise.resolve(delivery);
  }

  async findById(id: string): Promise<Delivery | null> {
    return Promise.resolve(this.deliveries.find((d) => d.id === id) || null);
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<void> {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (delivery) {
      delivery.status = status;
    }
    return Promise.resolve();
  }

  async findAll(): Promise<Delivery[]> {
    return Promise.resolve(this.deliveries);
  }
}
