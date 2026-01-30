export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly password: string; // hash
  readonly role: UserRole;
  readonly createdAt: Date;

  constructor(
    id: string,
    email: string,
    password: string,
    role: UserRole,
    createdAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;
  }

  static create(
    id: string,
    email: string,
    password: string,
    role: UserRole = UserRole.CUSTOMER,
    createdAt: Date = new Date(),
  ): User {
    return new User(id, email, password, role, createdAt);
  }
}
