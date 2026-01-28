import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Customer } from '../../domain/entities/Customer';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';

@Injectable()
export class GetCustomersUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(): Promise<Either<Error, Customer[]>> {
    try {
      const customers = await this.customerRepository.findAll();
      return right(customers);
    } catch (error) {
      return left(error as Error);
    }
  }
}
