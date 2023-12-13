import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "../schemas/user.schema";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private readonly authService: AuthService) {
    //this super() method is used to call the constructor of the parent class (PassportStrategy)
    super({
      usernameField: "email",
      passReqToCallback: false,
    });
  }

  //this validate() method is called by passport when a user tries to log in.
  validate(email: string, password: string): Promise<User> {
    return this.authService.signIn(email, password);
  }
}
