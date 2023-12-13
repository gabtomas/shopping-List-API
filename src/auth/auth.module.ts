import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "src/user/user.module";
import { LocalStrategy } from "./local.strategy";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GoogleStrategy } from "./google.strategy";

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      //using async because we need to inject the config service
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow("jwt.secret"),
        signOptions: {
          expiresIn: configService.getOrThrow("jwt.expireIn"),
          algorithm: "HS384",
        },
        verifyOptions: {
          algorithms: ["HS384"],
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
