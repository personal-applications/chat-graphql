import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { GuardModule } from './guard/guard.module';
import { MailModule } from './mail/mail.module';
import { MessageModule } from './message/message.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    UsersModule,
    DatabaseModule,
    ConfigModule,
    MailModule,
    MessageModule,
    GuardModule,
    AuthModule,
  ],
})
export class AppModule {}
