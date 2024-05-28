"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const User = require("./models/userModel");
cron.schedule("0 0 * * *", async () => {
    console.log("[SERVER]: Daily drop reset!");
    await User.updateMany({ dropEligible: true }, { dropStreak: 0 });
    await User.updateMany({}, { dropEligible: true });
}, {
    scheduled: true,
    timezone: "Europe/London",
});
