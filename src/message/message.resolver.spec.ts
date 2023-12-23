import { ApolloDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ConfigModule } from 'src/config/config.module';
import { CONFIG, Config } from 'src/config/config.provider';
import { AuthGuard } from 'src/guard/auth.guard';
import { User } from 'src/users/models/user.model';
import { UserRepository } from 'src/users/users.repository';
import { ValidationPipe } from 'src/validation/validation.pipe';
import request from 'supertest';
import { MessageRepository } from './message.repository';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

describe('MessageResolver', () => {
  let app: INestApplication;
  const messageRepositoryMock = {
    create: jest.fn(),
  };
  const userRepositoryMock = {
    findOneById: jest.fn(),
  };
  let jwt: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true }), JwtModule.register({}), ConfigModule],
      providers: [
        MessageResolver,
        MessageService,
        UserRepository,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: MessageRepository,
          useValue: messageRepositoryMock,
        },
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
      ],
    }).compile();

    const jwtService = module.get<JwtService>(JwtService);
    const config: Config = module.get(CONFIG);
    const user = {
      id: '1',
      email: 'email@email.com',
    } as User;
    jwt = jwtService.sign(
      {
        email: user.email,
      },
      {
        secret: config.jwtSecret,
        expiresIn: config.expiresIn,
        subject: user.id,
      },
    );

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('createMessage', () => {
    it('should throw unauthorized error if user is not logged in', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            createMessage(input: { to: "1", content: "Hello" }) {
              id
              content
              from {
                id
              }
              to {
                id
              }
            }
          }
        `,
        })
        .expect(StatusCodes.UNAUTHORIZED);

      expect(body.errors[0].message).toEqual(ReasonPhrases.UNAUTHORIZED);
    });

    it('should throw validation error if message is empty', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          query: `
            mutation {
              createMessage(input: { to: "1", content: "" }) {
                id
                content
                from {
                  id
                }
                to {
                  id
                }
              }
            }
          `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('content should not be empty');
    });

    it('should throw error if a message is sent to a non-existent user', async () => {
      userRepositoryMock.findOneById.mockResolvedValue(null);

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          query: `
          mutation {
            createMessage(input: { to: "2", content: "Hi there" }) {
              id
              content
              from {
                id
              }
              to {
                id
              }
            }
          }
        `,
        })
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.errors[0].message).toEqual('Message sent to invalid user');
    });

    it('should create a message successfully', async () => {
      const message = {
        id: '1',
        content: 'Hello',
        from: {
          id: '1',
        },
        to: {
          id: '2',
        },
      };
      messageRepositoryMock.create.mockResolvedValue(message);
      userRepositoryMock.findOneById.mockResolvedValue({
        id: '1',
      });

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          query: `
          mutation {
            createMessage(input: { to: "2", content: "Hello" }) {
              id
              content
              from {
                id
              }
              to {
                id
              }
            }
          }
        `,
        })
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body.data.createMessage).toEqual(message);
        });
    });
  });
});
