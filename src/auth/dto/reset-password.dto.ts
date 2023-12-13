import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @MinLength(8)
  @MaxLength(256)
  password: string;
}

@ObjectType()
export class ResetPasswordResponse {
  @Field()
  message: string;
}
