import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Response, Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  res: Response;
  req: Request;
};
