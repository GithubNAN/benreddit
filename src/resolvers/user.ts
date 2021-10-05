import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { UserInput } from "./UserInput";
import { validateRegister } from "../utils/validRegister";

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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) return null;

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { password, username, email }: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ password, username, email });
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword, email });

    // Validation of if user already exist
    try {
      // const [user] = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
      //   username,
      //   password: hashedPassword,
      //   created_at: new Date(),
      //   updated_at: new Date(),
      // });
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

    // Login in the use as well
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? {
            email: usernameOrEmail,
          }
        : { username: usernameOrEmail }
    );

    // Validation of user? can be applied here: LATER
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
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

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.error(err);
          resolve(false);
        }

        resolve(true);
      })
    );
  }
}
