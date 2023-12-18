import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';

export type CurrentUser = Pick<User, 'id' | 'email'>;

export const currentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const context = GqlExecutionContext.create(ctx);

  return context.getContext().req.user;
});
