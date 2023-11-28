import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [UsersResolver, UsersService, AuthService],
})
export class UsersModule {}
