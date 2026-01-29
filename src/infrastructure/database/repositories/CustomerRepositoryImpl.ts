import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepository } from '../../../domain/repositories/CustomerRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerEntity } from '../entities/CustomerEntity';

@Injectable()
export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const entity = this.customerRepository.create({
      id: crypto.randomUUID(),
      name: customerData.name,
      email: customerData.email,
      address: customerData.address,
    });

    const savedEntity = await this.customerRepository.save(entity);
    return new Customer(
      savedEntity.id,
      savedEntity.name,
      savedEntity.email,
      savedEntity.address,
    );
  }

  async save(customer: Customer): Promise<Customer> {
    const entity = this.customerRepository.create({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      address: customer.address,
    });

    const savedEntity = await this.customerRepository.save(entity);
    return new Customer(
      savedEntity.id,
      savedEntity.name,
      savedEntity.email,
      savedEntity.address,
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({ where: { id } });
    if (!entity) return null;

    return new Customer(entity.id, entity.name, entity.email, entity.address);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({ where: { email } });
    if (!entity) return null;

    return new Customer(entity.id, entity.name, entity.email, entity.address);
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.customerRepository.find();
    return entities.map(
      (entity) =>
        new Customer(entity.id, entity.name, entity.email, entity.address),
    );
  }
}
