import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication, UseGuards } from '@nestjs/common';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ConfigModule } from 'src/config/config.module';
import { CONFIG, Config } from 'src/config/config.provider';
import request from 'supertest';
import { AuthGuard } from './auth.guard';

@Resolver()
@UseGuards(AuthGuard)
class TestResolver {
  @Query((returns) => Boolean)
  root() {
    return true;
  }
}

describe('AuthGuard', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let config: Config;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: 'test.gql',
        }),
        ConfigModule,
        JwtModule.register({}),
      ],
      providers: [TestResolver],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    config = module.get<Config>(CONFIG);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should throw error if jwt is not provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            root
          }
        `,
      })
      .expect(StatusCodes.UNAUTHORIZED);

    expect(response.body.errors[0].message).toBe(ReasonPhrases.UNAUTHORIZED);
  });

  it('should throw error if jwt is not valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer invalid_token')
      .send({
        query: `
        query {
          root
        }
      `,
      })
      .expect(StatusCodes.UNAUTHORIZED);

    expect(response.body.errors[0].message).toBe(ReasonPhrases.UNAUTHORIZED);
  });

  it('should return true if jwt is valid', async () => {
    const jwt = jwtService.sign({ email: 'email@eemail.com' }, { secret: config.jwtSecret, expiresIn: config.expiresIn });
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        query: `
        query {
          root
        }
      `,
      })
      .expect(StatusCodes.OK);

    expect(response.body.data.root).toBe(true);
  });
});
