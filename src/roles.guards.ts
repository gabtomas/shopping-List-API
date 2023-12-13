import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ShoppingListService } from "./shopping-list/shopping-list.service";
// import { AuthService } from "./auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private shoppingListService: ShoppingListService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());

    if (roles.includes("owner")) {
      //get the user id from the cookie in the request
      const request = context.switchToHttp().getRequest();
      const userToken = request.cookies["token"];

      //use jwtService to extract the payload from the token
      const payload = this.jwtService.decode(userToken);
      const currentlyLoggedUserId = payload.sub;

      // Fetch the shopping list based on the route parameter
      const shoppingListId = request.params.id;
      const shoppingList =
        await this.shoppingListService.findById(shoppingListId);

      if (!shoppingList) {
        return false;
      }

      const hasRoleOwner =
        currentlyLoggedUserId === shoppingList.ownerId.toString();

      if (hasRoleOwner) {
        return true;
      }
    } else if (roles.includes("member")) {
      //get the user id from the cookie in the request
      const request = context.switchToHttp().getRequest();
      const userToken = request.cookies["token"];

      //use jwtService to extract the payload from the token
      const payload = this.jwtService.decode(userToken);
      const currentlyLoggedUserId = payload.sub;

      // Fetch the shopping list based on the route parameter
      const shoppingListId = request.params.id;
      const shoppingListMembers =
        await this.shoppingListService.findAllMembers(shoppingListId);

      //if currently logged user is a member of the shopping list
      const isMember =
        shoppingListMembers.filter(
          (member) => member["_id"].toString() === currentlyLoggedUserId,
        ).length > 0;

      // console.log("is member: ", isMember);
      if (isMember) {
        return true;
      }
    } else {
      return false;
    }
  }
}
