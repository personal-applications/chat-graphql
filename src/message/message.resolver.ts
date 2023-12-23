import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, currentUser } from 'src/decorator/current-user.decorator';
import { AuthGuard } from 'src/guard/auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { Message } from './models/message.model';

@Resolver((of) => Message)
@UseGuards(AuthGuard)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query((returns) => [Message])
  messages() {}

  @Mutation((returns) => Message)
  createMessage(@Args('input') input: CreateMessageDto, @currentUser() user: CurrentUser) {
    input.from = user.id;
    return this.messageService.create(input);
  }
}
