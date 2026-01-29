import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Customer } from '../../domain/entities/Customer';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: string): Promise<Either<Error, Customer>> {
    try {
      const customer = await this.customerRepository.findById(id);
      if (!customer) {
        return left(new Error(`Customer with id ${id} not found`));
      }
      return right(customer);
    } catch (error) {
      return left(error as Error);
    }
  }
}
