import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateMessageDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  content: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  to: string;

  from: string;
}
