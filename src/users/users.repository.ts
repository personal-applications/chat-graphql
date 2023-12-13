import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import { USER_REPOSITORY } from './users.provider';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: Repository<User>,
  ) {}

  findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  create(user: User) {
    return this.userRepository.save(user);
  }

  updateOneByEmail(email: string, info: Partial<User>) {
    return this.userRepository.update({ email }, info);
  }
}
