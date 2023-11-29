import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { RegisterInput } from './dto/register.dto';
import { User } from './models/user.model';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(input: RegisterInput) {
    let user = await this.userRepository.findUserByEmail(input.email);
    if (user) {
      throw new GraphQLError('Email already exists.', {
        extensions: {
          code: ReasonPhrases.BAD_REQUEST,
          http: {
            status: StatusCodes.BAD_REQUEST,
          },
        },
      });
    }

    input.password = bcrypt.hashSync(input.password, 10);
    user = new User();
    Object.assign(user, input);

    await this.userRepository.create(user);
    return true;
  }
}
