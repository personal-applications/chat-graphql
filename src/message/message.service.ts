import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { StatusCodes } from 'http-status-codes';
import { UserRepository } from 'src/users/users.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageRepository } from './message.repository';
import { Message } from './models/message.model';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(input: CreateMessageDto): Promise<Message> {
    if (input.from !== input.to) {
      const toUser = await this.userRepository.findOneById(input.to);
      if (!toUser) {
        throw new GraphQLError('Message sent to invalid user', {
          extensions: {
            code: StatusCodes.BAD_REQUEST,
            http: {
              status: StatusCodes.BAD_REQUEST,
            },
          },
        });
      }
    }

    return this.messageRepository.create(input);
  }
}
