import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { CONFIG, Config } from 'src/config/config.provider';
import { MailService } from 'src/mail/mail.service';
import { UserRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import request from 'supertest';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let app: INestApplication;
  const userRepositoryMock = {
    findUserByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mailServiceMock = {
    sendForgotPasswordEmail: jest.fn(),
  };
  let jwtService: JwtService;
  let config: Config;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: 'schema.gql',
        }),
        DatabaseModule,
        JwtModule.register({}),
        ConfigModule,
      ],
      providers: [
        AuthResolver,
        UsersService,
        AuthService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    jest.clearAllMocks();

    jwtService = module.get<JwtService>(JwtService);
    config = module.get<Config>(CONFIG);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('forgotPassword', () => {
    it('should send email if user exists', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        forgotPasswordSecret: 'forgotPasswordSecret',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      const sendForgotPasswordEmailSpy = jest.spyOn(mailServiceMock, 'sendForgotPasswordEmail');

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            forgotPassword(input: { email: "email@email.com" }) {
              message
            }
          }
        `,
        });

      expect(body.data.forgotPassword.message).toEqual(
        "Great! We've sent a password reset email. Check your inbox, and once you reset your password, you'll be back in action. If you don't see the email, please check your spam folder.",
      );
      expect(sendForgotPasswordEmailSpy).toHaveBeenCalledTimes(1);

      const sendForgotPasswordEmailCall = sendForgotPasswordEmailSpy.mock.calls[0];
      expect(sendForgotPasswordEmailCall[0]).toEqual('email@email.com');
      expect(sendForgotPasswordEmailCall[1]).toEqual('firstName lastName');

      const resetLink = sendForgotPasswordEmailCall[2];
      const url = new URL(resetLink);
      const token = url.searchParams.get('token');
      const decoded = jwtService.decode(token);
      expect(decoded.exp - decoded.iat).toEqual(config.expiresIn);
      expect(decoded.email).toEqual('email@email.com');
    });

    it('should not send email if user does not exist', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue(null);
      const sendForgotPasswordEmailSpy = jest.spyOn(mailServiceMock, 'sendForgotPasswordEmail');

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            forgotPassword(input: { email: "email@email.com" }) {
              message
            }
          }
        `,
        });

      expect(body.data.forgotPassword.message).toEqual(
        "Great! We've sent a password reset email. Check your inbox, and once you reset your password, you'll be back in action. If you don't see the email, please check your spam folder.",
      );
      expect(sendForgotPasswordEmailSpy).toHaveBeenCalledTimes(0);
    });

    it('should throw validation is email is not provided', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            forgotPassword(input: {}) {
              message
            }
          }
        `,
        });

      expect(body.errors[0].message).toEqual('Field "ForgotPasswordInput.email" of required type "String!" was not provided.');
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue(null);
      const createSpy = jest.spyOn(userRepositoryMock, 'create');

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            register(input: { password: "12345678", email: "email@email.com", firstName: "firstName", lastName: "lastName" })
          }
        `,
        });

      expect(body.data.register).toEqual(true);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw invalid email error if email is not valid', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue({
        email: 'email@email.com',
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: { password: "12345678", email: "email@email.com", firstName: "firstName", lastName: "lastName" })
            }
          `,
        });

      expect(body.errors[0].message).toEqual('Email already exists.');
    });

    it('should throw validation error if email is not provided', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: { password: "12345678" })
            }
          `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('Field "RegisterInput.email" of required type "String!" was not provided.');
    });
  });

  describe('logIn', () => {
    it('should log in successfully', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue({
        id: 'id',
        email: 'email@email.com',
        password: await bcrypt.hash('password', 10),
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            logIn(input: { email: "email@email.com", password: "password" }) {
              jwt
            }
          }
        `,
        });

      const decoded = jwtService.decode(body.data.logIn.jwt);
      expect(decoded.exp - decoded.iat).toEqual(config.expiresIn);
      expect(decoded.email).toEqual('email@email.com');
    });

    it('should throw credentials error when password is incorrect', async () => {
      userRepositoryMock.findUserByEmail.mockResolvedValue({
        password: 'password',
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            logIn(input: { email: "email@email.com", password: "12345678" }) {
              jwt
            }
          }
        `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('Invalid credentials.');
    });

    it('should throw credentials error when user does not exist', async () => {
      const findUserByEmail = jest.spyOn(userRepositoryMock, 'findUserByEmail');
      userRepositoryMock.findUserByEmail.mockResolvedValueOnce(null);

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            logIn(input: { email: "email@email.com", password: "12345678" }) {
              jwt
            }
          }
        `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('Invalid credentials.');
      expect(findUserByEmail).toHaveBeenCalledWith('email@email.com');
    });

    it('should throw validation error when email is not provided', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              logIn(input: { password: "123456" }) {
                jwt
              }
            }
          `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('Field "LogInInput.email" of required type "String!" was not provided.');
    });
  });
});
