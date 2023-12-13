import { Injectable, UnauthorizedException } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { SignUpDto } from "./dtos/SignUp.dto";
import { JwtService } from "@nestjs/jwt";
import { User } from "../schemas/user.schema";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { name, email, password } = signUpDto;

    // if user exists in database throw error
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    //generate password hash and save user to database
    const passwordHash = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email,
      password: passwordHash,
    };
    const user = await this.userService.create(userData);

    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid email");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid password");
    }

    return user;
  }

  //this method verifies the jwt payload extracted from the request
  async verifyPayload(payload: {
    sub: string;
    iat: number;
    exp: number;
  }): Promise<User> {
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async signToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };

    return await this.jwtService.signAsync(payload);
  }

  async oauthLogin(profile: {
    displayName: string;
    email: string;
  }): Promise<User> {
    const existingUser = await this.userService.findOneByEmail(profile.email);
    if (existingUser) {
      return existingUser;
    }

    const userData = {
      displayName: profile.displayName,
      email: profile.email,
    };
    const user = await this.userService.create(userData);

    return user;
  }
}
