import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { AuthService } from "../auth.service";
import type { User } from "../../schemas/user.schema";

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<User> {
    return next.handle().pipe(
      mergeMap(async (user) => {
        const response = context.switchToHttp().getResponse();

        //generata token and add it to response header and cookie
        const token = await this.authService.signToken(user["_id"].toString());

        //set token in response header and cookie
        response.setHeader("Authorization", `Bearer ${token}`);
        response.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
        });

        return user;
      }),
    );
  }
}
