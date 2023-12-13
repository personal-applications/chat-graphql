import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CONFIG, Config } from 'src/config/config.provider';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CONFIG)
    private readonly config: Config,
  ) {}

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return this.validate(ctx.getContext().req);
  }

  validate(req: Request): boolean {
    if (!req.headers.authorization) {
      return false;
    }

    if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
      return false;
    }

    const jwt = req.headers.authorization.split(' ')[1];
    try {
      this.jwtService.verify(jwt, { secret: this.config.jwtSecret });
      return true;
    } catch (e) {
      return false;
    }
  }
}
