import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { messageProvider } from './message.provider';
import { MessageRepository } from './message.repository';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [DatabaseModule, ConfigModule, UsersModule],
  providers: [MessageService, MessageResolver, MessageRepository, messageProvider],
})
export class MessageModule {}
