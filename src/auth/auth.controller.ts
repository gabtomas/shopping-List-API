import { Controller } from "@nestjs/common";
import {
  Req,
  Res,
  Get,
  Body,
  Post,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { SignUpDto } from "./dtos/SignUp.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/Login.dto";
// import { AuthGuard } from "@nestjs/passport";
import { User } from "../schemas/user.schema";
import { TokenInterceptor } from "./interceptors/token.interceptor";
import { Response } from "express";
import { AuthUser } from "./user.decorator";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JWTAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleOauthGuard } from "./guards/google-oauth.guard";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("signup")
  @UseInterceptors(TokenInterceptor)
  signUp(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signUpDto);
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async login(@AuthUser() user: LoginDto): Promise<any> {
    return user;
  }

  @Get("me")
  @UseGuards(JWTAuthGuard)
  async me(@AuthUser() user: User): Promise<any> {
    return { user };
  }

  @Get("google")
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get("google/callback")
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@AuthUser() user: any, @Res() response: Response) {
    await this.addTokenToResponse(response, user);
    const redirectUrl = "http://localhost:3003/auth/me";
    response.redirect(redirectUrl);
  }

  private async addTokenToResponse(response: Response, user: any) {
    const token = await this.authService.signToken(user);

    response.setHeader("Authorization", `Bearer ${token}`);
    response.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
  }
}
