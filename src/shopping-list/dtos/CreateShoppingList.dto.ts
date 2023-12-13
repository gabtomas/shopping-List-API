import { IsString, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ItemDto {
  @IsString()
  name: string;

  @IsBoolean()
  done: boolean;
}

class CreateShoppingListDto {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export { CreateShoppingListDto, ItemDto };
