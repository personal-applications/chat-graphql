import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ForgotPasswordInput, ForgotPasswordResponse } from './dto/forgot-password.dto';
import { LogInInput, LogInResponse } from './dto/login.dto';
import { RegisterInput } from './dto/register.dto';
import { ResetPasswordInput, ResetPasswordResponse } from './dto/reset-password.dto';

@Resolver((of) => User)
export class AuthResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Query((returns) => [User])
  async users() {}

  @Mutation((returns) => ResetPasswordResponse)
  resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.authService.resetPassword(input);
  }

  @Mutation((returns) => ForgotPasswordResponse)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    input.email = input.email.toLocaleLowerCase();

    return this.authService.forgotPassword(input);
  }

  @Mutation((returns) => Boolean)
  register(@Args('input') input: RegisterInput): Promise<boolean> {
    input.email = input.email.toLowerCase();

    return this.userService.create(input);
  }

  @Mutation((returns) => LogInResponse)
  logIn(@Args('input') input: LogInInput): Promise<LogInResponse> {
    input.email = input.email.toLowerCase();
    return this.authService.logIn(input);
  }
}
