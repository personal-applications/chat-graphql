import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { StatusCodes } from 'http-status-codes';
import * as request from 'supertest';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './auth.service';
import { UserRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UserResolver', () => {
  let app: INestApplication;
  const userRepositoryMock = {
    findUserByEmail: jest.fn(),
    create: jest.fn(),
  };

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
        UsersResolver,
        UsersService,
        AuthService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    jest.clearAllMocks();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
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

      expect(body.errors[0].message).toEqual(
        'Field "RegisterInput.email" of required type "String!" was not provided.',
      );
    });
  });

  describe('logIn', () => {
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

      expect(body.errors[0].message).toEqual(
        'Field "LogInInput.email" of required type "String!" was not provided.',
      );
    });
  });
});
