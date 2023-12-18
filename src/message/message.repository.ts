import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/models/user.model';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { MESSAGE_REPOSITORY } from './message.provider';
import { Message } from './models/message.model';

@Injectable()
export class MessageRepository {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: Repository<Message>,
  ) {}

  create(input: CreateMessageDto): Promise<Message> {
    const message = new Message();
    message.from = new User(input.from);
    message.to = new User(input.to);
    message.content = input.content;
    return this.messageRepository.save(message);
  }
}
