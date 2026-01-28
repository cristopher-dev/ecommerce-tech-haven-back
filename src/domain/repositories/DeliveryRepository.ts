import { Delivery, DeliveryStatus } from '../entities/Delivery';

export interface DeliveryRepository {
  create(delivery: Omit<Delivery, 'id' | 'createdAt'>): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  updateStatus(id: string, status: DeliveryStatus): Promise<void>;
  findAll(): Promise<Delivery[]>;
}
