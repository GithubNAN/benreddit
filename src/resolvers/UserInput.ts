import { InputType, Field } from "type-graphql";

// import { EntityManager } from "@mikro-orm/knex";
@InputType()
export class UserInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
