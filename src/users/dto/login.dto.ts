import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogInResponse {
  @Field()
  jwt: string;
}

@InputType()
export class LogInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
