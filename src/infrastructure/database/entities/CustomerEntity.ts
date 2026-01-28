import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  address: string;
}
