import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class ResponseError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [ResponseError], { nullable: true })
  errors?: ResponseError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { username, password }: UserInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // validation of registering username
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username length must be longer than 2 characters",
          },
        ],
      };
    }

    // Validation of registering password
    if (password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be longer than 3 characters",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });

    // Validation of if user already exist
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      console.error(err);
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already exist",
            },
          ],
        };
      }

      return {
        errors: [
          {
            field: "unknown error",
            message: "something wrong...",
          },
        ],
      };
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") { username, password }: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username,
    });

    // Validation of user? can be applied here: LATER
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    // Validation of password? can be applied here: LATER
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }
}
