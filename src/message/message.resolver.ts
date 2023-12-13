import { Resolver } from '@nestjs/graphql';
import { Message } from './models/message.model';

@Resolver((of) => Message)
export class MessageResolver {}
