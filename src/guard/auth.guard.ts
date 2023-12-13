import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    ctx.getContext();
    return true;
  }
}
