import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, MaxLength } from 'class-validator';

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  @MaxLength(256)
  email: string;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field()
  message: string;
}
