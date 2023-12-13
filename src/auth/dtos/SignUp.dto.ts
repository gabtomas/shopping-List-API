import { IsEmail, MinLength, IsNotEmpty } from "class-validator";

export class SignUpDto {
  @MinLength(3)
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;
}
