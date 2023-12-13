import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @MaxLength(256)
  email: string;

  @Field()
  @MinLength(8)
  @MaxLength(256)
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  lastName: string;
}
