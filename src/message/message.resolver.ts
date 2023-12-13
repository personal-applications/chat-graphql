import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guard/auth.guard';
import { Message } from './models/message.model';

@Resolver((of) => Message)
export class MessageResolver {
  @Mutation((returns) => Boolean)
  @UseGuards(AuthGuard)
  createMessage() {
    return true;
  }
}
