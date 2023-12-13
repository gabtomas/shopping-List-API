import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ShoppingList } from "src/schemas/shoppingList.schema";
import { CreateShoppingListDto } from "./dtos/CreateShoppingList.dto";
import { UpdateShoppingListDto } from "./dtos/UpdateShoppingList.dto";
import { User } from "src/schemas/user.schema";

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
  ) {}

  async create(
    shoppingList: CreateShoppingListDto,
    user: User,
  ): Promise<ShoppingList> {
    const ownerId = user["_id"].toString();
    //add ownerId to shoppingList as ownerId and also to the members array which is already in the shoppingList with some members
    const newShoppingList = new this.shoppingListModel({
      ...shoppingList,
      ownerId,
      members: [ownerId, ...shoppingList.members],
    });

    return await newShoppingList.save();
  }

  async findAll(): Promise<ShoppingList[]> {
    return await this.shoppingListModel.find().exec();
  }

  async findById(id: string): Promise<ShoppingList> {
    return await this.shoppingListModel.findById(id).exec();
  }

  async updateById(
    id: string,
    shoppingList: Partial<UpdateShoppingListDto>,
  ): Promise<ShoppingList> {
    const updatedShoppingList = await this.shoppingListModel
      .findByIdAndUpdate(id, shoppingList, { new: true })
      .exec();
    if (updatedShoppingList) {
      return updatedShoppingList;
    }
    return null;
  }

  async deleteById(id: string): Promise<string> {
    const shoppingList = await this.shoppingListModel
      .findByIdAndDelete(id)
      .exec();
    if (shoppingList) {
      return "succesfully deleted";
    }
    return "could not delete";
  }

  //findAllMy() is a route to view all shopping lists where currently logged user is a member in the shopping list
  async findAllMy(user: User): Promise<ShoppingList[]> {
    const ownerId = user["_id"].toString();
    return await this.shoppingListModel.find({ members: ownerId }).exec();
  }

  //find all members of a shopping list
  async findAllMembers(shoppingListId: string): Promise<User[]> {
    const shoppingList = await this.shoppingListModel
      .findById(shoppingListId)
      .exec();
    if (shoppingList) {
      const members = shoppingList.members;
      return members;
    }
    return null;
  }

  //leaveShoppingList
  async leaveShoppingList(shoppingListId: string, user: User) {
    //check if user is owner of the shopping list
    const shoppingList = await this.shoppingListModel
      .findById(shoppingListId)
      .exec();
    if (shoppingList) {
      const ownerId = shoppingList.ownerId;
      if (ownerId === user["_id"].toString()) {
        //  return "you are the owner, you can not leave";
        throw new Error("you are the owner, you can not leave");
      }

      //check if user is a member of the shopping list in the members array
      const members = shoppingList.members;
      const isMember =
        members.filter((member) => member.toString() === user["_id"].toString())
          .length > 0;
      if (isMember) {
        console.log("ise member and leaveing now", user["_id"].toString());
        const newMembers = members.filter(
          (member) => member.toString() !== user["_id"].toString(),
        );
        const updatedShoppingList = await this.shoppingListModel
          .findByIdAndUpdate(
            shoppingListId,
            { members: newMembers },
            { new: true },
          )
          .exec();
        if (updatedShoppingList) {
          return updatedShoppingList;
        }
      }
    }
  }

  //addMemberToShoppingList
  async addMemberToShoppingList(shoppingListId: string, user: string) {
    const shoppingList = await this.shoppingListModel
      .findById(shoppingListId)
      .exec();
    if (shoppingList) {
      const members = shoppingList.members;

      //check if user is already in the members array
      const isMember =
        members.filter((member) => member.toString() === user).length > 0;
      if (isMember) {
        console.log(user, " is already a member");
        return "user is already a member";
      }
      const newMembers = [...members, user];
      const updatedShoppingList = await this.shoppingListModel
        .findByIdAndUpdate(
          shoppingListId,
          { members: newMembers },
          { new: true },
        )
        .exec();
      if (updatedShoppingList) {
        return updatedShoppingList;
      }
    }
    return null;
  }
}
