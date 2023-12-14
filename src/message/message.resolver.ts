import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guard/auth.guard';
import { Message } from './models/message.model';

@Resolver((of) => Message)
@UseGuards(AuthGuard)
export class MessageResolver {
  @Mutation((returns) => Boolean)
  createMessage() {
    return true;
  }
}
