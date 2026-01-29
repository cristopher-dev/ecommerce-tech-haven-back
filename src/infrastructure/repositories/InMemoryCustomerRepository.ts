import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../domain/entities/Customer';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';

@Injectable()
export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers: Customer[] = [];

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const customer = new Customer(
      uuidv4(),
      data.name,
      data.email,
      data.address,
    );
    this.customers.push(customer);
    return await Promise.resolve(customer);
  }

  async save(customer: Customer): Promise<Customer> {
    const existingIndex = this.customers.findIndex((c) => c.id === customer.id);
    if (existingIndex !== -1) {
      this.customers[existingIndex] = customer;
    } else {
      this.customers.push(customer);
    }
    return await Promise.resolve(customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return await Promise.resolve(
      this.customers.find((c) => c.id === id) || null,
    );
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await Promise.resolve(
      this.customers.find((c) => c.email === email) || null,
    );
  }

  async findAll(): Promise<Customer[]> {
    return await Promise.resolve(this.customers);
  }
}
