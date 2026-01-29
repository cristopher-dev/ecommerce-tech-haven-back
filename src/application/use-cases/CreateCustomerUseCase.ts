import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Customer } from '../../domain/entities/Customer';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';

export interface CreateCustomerInput {
  name: string;
  email: string;
  address: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(input: CreateCustomerInput): Promise<Either<Error, Customer>> {
    try {
      // Check if customer already exists by email
      const existingCustomer = await this.customerRepository.findByEmail(
        input.email,
      );
      if (existingCustomer) {
        return left(
          new Error(`Customer with email ${input.email} already exists`),
        );
      }

      // Create new customer
      const customer = new Customer(
        this.generateId(),
        input.name,
        input.email,
        input.address,
      );

      const savedCustomer = await this.customerRepository.save(customer);
      return right(savedCustomer);
    } catch (error) {
      return left(error as Error);
    }
  }

  private generateId(): string {
    return `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
