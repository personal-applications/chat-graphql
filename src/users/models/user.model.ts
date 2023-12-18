import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Message } from 'src/message/models/message.model';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 256 })
  firstName: string;

  @Field()
  @Column({ length: 256 })
  lastName: string;

  @Field()
  @Column({ unique: true, length: 256 })
  email: string;

  @Column({ length: 256 })
  forgotPasswordSecret: string;

  @Field()
  @Column({ length: 256 })
  password: string;

  @OneToMany((type) => Message, (message) => message.from)
  receivedMessages: Message[];

  @OneToMany((type) => Message, (message) => message.to)
  sentMessages: Message[];

  @Field((type) => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  constructor(id?: string) {
    this.id = id;
  }
}
