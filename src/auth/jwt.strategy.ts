import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt, JwtFromRequestFunction } from "passport-jwt";
import { AuthService } from "./auth.service";
import { User } from "src/schemas/user.schema";
import { JwtPayload } from "./jwtPayload.interface";

//function to extract jwt from request cookie
const extractJwtFromCookie: JwtFromRequestFunction = (request) => {
  return request.cookies["token"];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.getOrThrow("jwt.secret"),
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  // this validate method will be called to validate the jwt payload extracted from the request
  validate(payload: JwtPayload): Promise<User> {
    return this.authService.verifyPayload(payload);
  }
}
