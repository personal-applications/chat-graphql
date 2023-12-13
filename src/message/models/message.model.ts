import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ length: 256 })
  @Field()
  content: string;

  @ManyToOne((type) => User, (user) => user.receivedMessages)
  @Field((type) => User)
  from: User;

  @ManyToOne((type) => User, (user) => user.sentMessages)
  @Field((type) => User)
  to: User;

  @CreateDateColumn()
  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
