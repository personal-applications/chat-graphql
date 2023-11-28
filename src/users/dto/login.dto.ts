import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@ObjectType()
export class LogInResponse {
  @Field()
  jwt: string;
}

@InputType()
export class LogInInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  @MaxLength(256)
  password: string;
}
