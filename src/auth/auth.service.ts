import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import crypto from 'node:crypto';
import { MailService } from 'src/mail/mail.service';
import { CONFIG, Config } from '../config/config.provider';
import { ForgotPasswordInput, ForgotPasswordResponse } from '../users/dto/forgot-password.dto';
import { LogInInput, LogInResponse } from '../users/dto/login.dto';
import { ResetPasswordInput, ResetPasswordResponse } from '../users/dto/reset-password.dto';
import { User } from '../users/models/user.model';
import { UserRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(CONFIG)
    private readonly config: Config,
    private readonly mailService: MailService,
  ) {}

  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResponse> {
    const decoded = this.jwtService.decode(input.token);
    const user = await this.userRepository.findUserByEmail(decoded?.email ?? '');
    if (!user) {
      throw new GraphQLError('Invalid token.', {
        extensions: {
          code: ReasonPhrases.BAD_REQUEST,
          http: {
            status: StatusCodes.BAD_REQUEST,
          },
        },
      });
    }

    let email: string;
    try {
      const verifiedInfos = this.jwtService.verify(input.token, { secret: user.forgotPasswordSecret });
      email = verifiedInfos['email'];
    } catch (error) {
      this.logger.error(`Verify token error: ${JSON.stringify(error, null, 2)}`);
      throw new GraphQLError('Invalid token.', {
        extensions: {
          code: ReasonPhrases.BAD_REQUEST,
          http: {
            status: StatusCodes.BAD_REQUEST,
          },
        },
      });
    }

    const newForgotPasswordSecret = crypto.randomBytes(20).toString('hex');
    const newPassword = bcrypt.hashSync(input.password, 10);
    await this.userRepository.updateOneByEmail(email, { forgotPasswordSecret: newForgotPasswordSecret, password: newPassword });

    await this.mailService.sendResetPasswordConfirmationEmail(email, user.firstName + ' ' + user.lastName);

    return {
      message: 'Your password has been successfully reset.',
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const user = await this.userRepository.findUserByEmail(input.email);
    if (user) {
      const userName = user.firstName + ' ' + user.lastName;
      const resetLink = `${this.config.frontendUrl}/reset-password?token=${this.createForgotPasswordJWT(user)}`;
      await this.mailService.sendForgotPasswordEmail(input.email, userName, resetLink);
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
