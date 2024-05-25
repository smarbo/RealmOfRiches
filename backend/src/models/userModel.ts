import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  balance: number;
  dropEligible: boolean;
  inventory: (string | undefined)[];
}

const myMan: IUser = {
  name: "eddie",
  email: "edieobram",
  password: "pwd",
  balance: 0,
  dropEligible: false,
  inventory: [],
};

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: String,
  password: { type: String, required: true },
  balance: { type: Number, required: true },
  dropEligible: { type: Boolean, required: true },
  inventory: { type: [String] },
});

const User = model<IUser>("User", userSchema);

module.exports = User;
