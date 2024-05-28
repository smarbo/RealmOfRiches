import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  balance: number;
  dropEligible: boolean;
  dropStreak: number;
  inventory: (string | undefined)[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, required: true },
  dropEligible: { type: Boolean, required: true },
  dropStreak: { type: Number, required: true },
  inventory: { type: [String] },
});

const User = model<IUser>("User", userSchema);

module.exports = User;
