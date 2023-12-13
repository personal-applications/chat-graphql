import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [MessageService, MessageResolver],
})
export class MessageModule {}
