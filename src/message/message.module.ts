import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [DatabaseModule],
  providers: [MessageService, MessageResolver],
})
export class MessageModule {}
