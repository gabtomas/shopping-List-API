import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../schemas/user.schema";

export const AuthUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as User;

    return data ? user && user[data] : user;
  },
);
