import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema()
export class ShoppingList extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }],
    required: true,
  })
  members: User[];

  @Prop([
    {
      name: { type: String, required: true },
      done: { type: Boolean, default: false },
    },
  ])
  items: { name: string; done?: boolean }[];

  //add ownerId - which will be mongoose.Schema.Types.ObjectId
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  ownerId: MongooseSchema.Types.ObjectId;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);
