import { Module } from "@nestjs/common";
import { ShoppingListController } from "./shopping-list.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { ShoppingListSchema } from "../schemas/shoppingList.schema";
import { ShoppingListService } from "./shopping-list.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: "ShoppingList", schema: ShoppingListSchema },
    ]),
  ],
  controllers: [ShoppingListController],
  providers: [ShoppingListService],
})
export class ShoppingListModule {}
