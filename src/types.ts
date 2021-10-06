import { Request, Response } from "express";
import { Redis } from "ioredis";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  res: Response;
  redis: Redis;
  req: Request;
};
