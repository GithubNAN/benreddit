import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Response, Request } from "express";
import { Redis } from "ioredis";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  res: Response;
  redis: Redis;
  req: Request;
};
