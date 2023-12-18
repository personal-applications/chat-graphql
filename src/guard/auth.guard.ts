import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GraphQLError } from 'graphql';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { CONFIG, Config } from 'src/config/config.provider';
import { CurrentUser } from 'src/decorator/current-user.decorator';

declare module 'express' {
  interface Request {
    user: CurrentUser;
  }
}

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
      throw new GraphQLError(ReasonPhrases.UNAUTHORIZED, {
        extensions: {
          code: StatusCodes.UNAUTHORIZED,
          http: {
            status: StatusCodes.UNAUTHORIZED,
          },
        },
      });
    }

    if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
      throw new GraphQLError(ReasonPhrases.UNAUTHORIZED, {
        extensions: {
          code: StatusCodes.UNAUTHORIZED,
          http: {
            status: StatusCodes.UNAUTHORIZED,
          },
        },
      });
    }

    const jwt = req.headers.authorization.split(' ')[1];
    try {
      const verifiedInfo = this.jwtService.verify(jwt, { secret: this.config.jwtSecret });
      req.user = {
        email: verifiedInfo.email,
        id: verifiedInfo.sub,
      };

      return true;
    } catch (e) {
      console.error(e);
      throw new GraphQLError(ReasonPhrases.UNAUTHORIZED, {
        extensions: {
          code: StatusCodes.UNAUTHORIZED,
          http: {
            status: StatusCodes.UNAUTHORIZED,
          },
        },
      });
    }
  }
}
