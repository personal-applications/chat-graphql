import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthService } from './auth.service';
import { userProviders } from './users.provider';
import { UserRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({}), ConfigModule, MailModule],
  providers: [
    UsersResolver,
    UsersService,
    AuthService,
    UserRepository,
    ...userProviders,
  ],
})
export class UsersModule {}
