import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from './users.provider';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({}), ConfigModule],
  providers: [UsersService, UserRepository, ...userProviders],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
