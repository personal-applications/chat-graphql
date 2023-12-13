import { Mutation, Resolver } from '@nestjs/graphql';
import { Message } from './models/message.model';

@Resolver((of) => Message)
export class MessageResolver {
  @Mutation((returns) => Message)
  createMessage() {}
}
