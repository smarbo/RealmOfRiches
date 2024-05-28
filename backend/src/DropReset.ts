const cron = require("node-cron");
import { IUser } from "./models/userModel";
import { Model } from "mongoose";

const User: Model<IUser> = require("./models/userModel");

cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("[SERVER]: Daily drop reset!");
    await User.updateMany({ dropEligible: true }, { dropStreak: 0 });
    await User.updateMany({}, { dropEligible: true });
  },
  {
    scheduled: true,
    timezone: "Europe/London",
  }
);
