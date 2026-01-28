import { Customer } from '../entities/Customer';

export interface CustomerRepository {
  create(customer: Omit<Customer, 'id'>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}
