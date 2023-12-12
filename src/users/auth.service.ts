import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { MailService } from 'src/mail/mail.service';
import { CONFIG, Config } from '../config/config.provider';
import { ForgotPasswordInput, ForgotPasswordResponse } from './dto/forgot-password.dto';
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
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const user = await this.userRepository.findUserByEmail(input.email);
    if (user) {
      const userName = user.firstName + ' ' + user.lastName;
      const resetLink = `${this.config.frontendUrl}/reset-password?token=${this.createForgotPasswordJWT(user)}`;
      await this.mailService.sendForgotPasswordEmail(userName, input.email, resetLink);
    }

    return {
      message:
        "Great! We've sent a password reset email. Check your inbox, and once you reset your password, you'll be back in action. If you don't see the email, please check your spam folder.",
    };
  }

  createForgotPasswordJWT(user: User) {
    return this.jwtService.sign(
      {
        email: user.email,
      },
      {
        secret: user.forgotPasswordSecret,
        expiresIn: this.config.expiresIn,
        subject: user.id,
      },
    );
  }

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
