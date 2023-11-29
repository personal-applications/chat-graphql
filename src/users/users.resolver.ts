import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LogInInput, LogInResponse } from './dto/login.dto';
import { RegisterInput } from './dto/register.dto';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Query((returns) => [User])
  async users() {}

  @Mutation(() => Boolean)
  register(@Args('input') input: RegisterInput) {
    input.email = input.email.toLowerCase();

    return this.userService.create(input);
  }

  @Mutation((returns) => LogInResponse)
  logIn(@Args('input') input: LogInInput): Promise<LogInResponse> {
    input.email = input.email.toLowerCase();
    return this.authService.logIn(input);
  }
}
