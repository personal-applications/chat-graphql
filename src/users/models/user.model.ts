import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Field((type) => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;
}
