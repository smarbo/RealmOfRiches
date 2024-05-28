"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, required: true },
    dropEligible: { type: Boolean, required: true },
    dropStreak: { type: Number, required: true },
    inventory: { type: [String] },
});
const User = (0, mongoose_1.model)("User", userSchema);
module.exports = User;
