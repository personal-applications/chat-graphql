import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { CONFIG, Config } from '../config/config.provider';
import { LogInInput, LogInResponse } from './dto/login.dto';
import { User } from './models/user.model';
import { UserRepository } from './users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(CONFIG)
    private readonly config: Config,
  ) {}

  createJWT(user: User) {
    return this.jwtService.sign(
      {
        email: user.email,
      },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.expiresIn,
        subject: user.id,
      },
    );
  }

  async logIn(input: LogInInput): Promise<LogInResponse> {
    const user = await this.userRepository.findUserByEmail(input.email);
    if (!user) {
      throw new GraphQLError('Invalid credentials.', {
        extensions: {
          code: ReasonPhrases.BAD_REQUEST,
          http: {
            status: StatusCodes.BAD_REQUEST,
          },
        },
      });
    }

    if (!(await bcrypt.compare(input.password, user.password))) {
      throw new GraphQLError('Invalid credentials.', {
        extensions: {
          code: ReasonPhrases.BAD_REQUEST,
          http: {
            status: StatusCodes.BAD_REQUEST,
          },
        },
      });
    }

    return {
      jwt: this.createJWT(user),
    };
  }
}
