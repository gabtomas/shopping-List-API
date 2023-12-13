import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";

import { JWTAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateShoppingListDto } from "./dtos/CreateShoppingList.dto";
import { ShoppingListService } from "./shopping-list.service";
import { ShoppingList } from "src/schemas/shoppingList.schema";
import { UpdateShoppingListDto } from "./dtos/UpdateShoppingList.dto";
import { AuthUser } from "src/auth/user.decorator";
import { User } from "src/schemas/user.schema";
import { RolesGuard } from "src/roles.guards";
import { Roles } from "src/roles.decorator";

@Controller("shopping-list")
export class ShoppingListController {
  constructor(private shoppingListService: ShoppingListService) {}

  //route to create a shopping list
  @Post()
  @UseGuards(JWTAuthGuard)
  async create(
    @Body() shoppingList: CreateShoppingListDto,
    @AuthUser() user: User,
  ): Promise<ShoppingList> {
    return await this.shoppingListService.create(shoppingList, user);
  }

  //route to view all shopping lists (for overview)
  @Get("/all")
  @UseGuards(JWTAuthGuard)
  async findAll(): Promise<ShoppingList[]> {
    return await this.shoppingListService.findAll();
  }

  //route to view all shopping lists where currently logged user is a member in the shopping list
  //if he is a member, he is also owner
  @Get()
  @UseGuards(JWTAuthGuard)
  async findAllMy(@AuthUser() user: User): Promise<ShoppingList[]> {
    return await this.shoppingListService.findAllMy(user);
  }

  //route to view a shopping list by id
  @Get(":id")
  @UseGuards(JWTAuthGuard)
  async findById(@Param("id") id: string) {
    const shoppingList = await this.shoppingListService.findById(id);
    if (!shoppingList) {
      return {
        statusCode: 404,
        message: "Shopping list not found",
      };
    }
    return shoppingList;
  }

  //route to update a shopping list by id ony by owner of the shopping list
  @Put(":id")
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @Roles("owner")
  @UseGuards(JWTAuthGuard)
  async updateById(
    @Param("id") shoppingListId: string,
    @Body() shoppingList: UpdateShoppingListDto,
  ) {
    return await this.shoppingListService.updateById(
      shoppingListId,
      shoppingList,
    );
  }

  //route to delete a shopping list by id only by owner of the shopping list
  @Delete(":id")
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @Roles("owner")
  async deleteById(@Param("id") id: string) {
    return await this.shoppingListService.deleteById(id);
  }

  //if user is not owner of the shopping list, and is member, he can leave the shopping list
  @Get(":id/leave")
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @Roles("member")
  async leaveShoppingList(@Param("id") id: string, @AuthUser() user: User) {
    return await this.shoppingListService.leaveShoppingList(id, user);
  }

  //route to add a member to a shopping list, only by owner of the shopping list
  @Post(":id/add-member")
  @UseGuards(JWTAuthGuard)
  @UseGuards(RolesGuard)
  @Roles("owner")
  async addMember(
    @Param("id") id: string,
    @Body() member: { memberId: string },
  ) {
    return await this.shoppingListService.addMemberToShoppingList(
      id,
      member.memberId,
    );
  }
}
