import { Customer } from '../entities/Customer';

export interface CustomerRepository {
  create(customer: Omit<Customer, 'id'>): Promise<Customer>;
  save(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}
