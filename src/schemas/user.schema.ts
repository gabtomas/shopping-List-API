import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop({ unique: [true, "Email must be unique"] })
  email: string;

  @Prop()
  password: string;
}

export type UserDocument = User & Document; // Extend Document for Mongoose support
export const UserSchema = SchemaFactory.createForClass(User);
