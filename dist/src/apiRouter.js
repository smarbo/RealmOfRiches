"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const apihandler_1 = __importDefault(require("./apihandler"));
const apiRouter = (0, express_1.Router)();
apiRouter.use(express_1.default.json());
require("dotenv").config();
const User = require("./models/userModel.js");
require("./db.js");
const bcrypt = require("bcryptjs");
const transfer = async (from, to, amount) => {
    try {
        const fromUser = await User.findOne({ name: from });
        amount = Math.floor(amount);
        if (fromUser) {
            if (fromUser.balance >= amount) {
                await User.updateOne({ name: from }, { $inc: { balance: -amount } });
                await User.updateOne({ name: to }, { $inc: { balance: amount } });
            }
            else {
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
};
// API POST ROUTE
const POST = async (req, res) => {
    if (req.body.username && req.body.email && req.body.password) {
        try {
            if ((await User.find({
                $or: [{ name: req.body.username }, { email: req.body.email }],
            })).length >= 1) {
                return res
                    .status(409)
                    .json({ message: "Username/Email already exists." });
            }
            // User doesn't exist
            const hash = await bcrypt.hash(req.body.password, 10);
            await User.create({
                name: req.body.username,
                password: hash,
                email: req.body.email,
                balance: 0,
                dropEligible: true,
                dropStreak: 0,
                inventory: ["ironSword", "", "", "", "", "", "", ""],
            });
        }
        catch (err) {
            return res.status(500).json(err);
        }
        return res.status(200).json({
            username: req.body.username,
            email: req.body.email,
            balance: 0,
            dropEligible: true,
            dropStreak: 0,
            inventory: ["ironSword", "", "", "", "", "", "", ""],
        });
    }
    else {
        return res.status(400).json({ message: "Invalid request." });
    }
};
const GET = async (req, res) => {
    return res.status(200).json({ users: await User.find({}) });
};
const PUT = async (req, res) => {
    let user;
    if (req.body.password) {
        try {
            if (req.body.username) {
                user = await User.findOne({ name: req.body.username });
            }
            else if (req.body.email) {
                user = await User.findOne({ email: req.body.email });
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        return res.status(405).json({ message: "Invalid request" });
    }
    if (user) {
        const auth = await bcrypt.compare(req.body.password, user.password);
        if (auth) {
            return res.status(200).json({
                authenticated: auth,
                email: user.email,
                username: user.name,
                balance: user.balance,
                dropEligible: user.dropEligible,
                dropStreak: user.dropStreak,
                inventory: user.inventory,
            });
        }
        else {
            return res.status(200).json({ authenticated: auth });
        }
    }
    else {
        return res.status(404).json({ message: `User not found.` });
    }
};
const GETUSER = async (req, res) => {
    const { username } = req.params;
    try {
        return res.status(200).json(await User.findOne({ name: username }));
    }
    catch (err) {
        console.log(err);
    }
};
const PUTUSER = async (req, res) => {
    const { username } = req.params;
    try {
        await User.updateOne({ name: username }, req.body);
        return res.status(200).json(await User.findOne({ name: username }));
    }
    catch (err) {
        console.log(err);
    }
};
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const CLAIMDROP = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ name: username });
        if (user && user.dropEligible) {
            const dropQuality = randInt(0, 15);
            let dropGems;
            switch (dropQuality) {
                case 0:
                    dropGems = randInt(1, 5);
                    break;
                case 1:
                    dropGems = randInt(1, 5);
                    break;
                case 2:
                    dropGems = randInt(1, 5);
                    break;
                case 3:
                    dropGems = randInt(1, 5);
                    break;
                case 4:
                    dropGems = randInt(1, 5);
                    break;
                case 5:
                    dropGems = randInt(1, 5);
                    break;
                case 6:
                    dropGems = randInt(1, 5);
                    break;
                case 7:
                    dropGems = randInt(5, 10);
                    break;
                case 8:
                    dropGems = randInt(5, 10);
                    break;
                case 9:
                    dropGems = randInt(5, 10);
                    break;
                case 10:
                    dropGems = randInt(5, 10);
                    break;
                case 11:
                    dropGems = randInt(5, 10);
                    break;
                case 12:
                    dropGems = randInt(15, 30);
                    break;
                case 13:
                    dropGems = randInt(15, 30);
                    break;
                case 14:
                    dropGems = randInt(15, 30);
                    break;
                case 15:
                    dropGems = randInt(100, 250);
                    break;
                default:
                    dropGems = 5;
                    break;
            }
            dropGems *= user.dropStreak / 3 + 1;
            await transfer("bank", user.name, dropGems);
            await User.updateOne({ name: user.name }, { dropEligible: false, $inc: { dropStreak: 1 } });
            return res.status(200).json({ dropQuality, dropGems });
        }
        else {
            return res.status(401).json({ message: "User not eligible for drop." });
        }
    }
    catch (err) {
        console.log(err);
    }
};
// API ROUTER
const handler = new apihandler_1.default({
    post: POST,
    get: GET,
    put: PUT,
    authKeys: [process.env.AUTH_KEY],
});
const userHandler = new apihandler_1.default({
    get: GETUSER,
    put: PUTUSER,
    authKeys: [process.env.AUTH_KEY],
});
const dropHandler = new apihandler_1.default({
    post: CLAIMDROP,
    authKeys: [process.env.AUTH_KEY],
});
apiRouter.post("/drop/:username", async (req, res) => {
    dropHandler.handleRequest(req, res);
});
apiRouter.post("/user", async (req, res) => {
    handler.handleRequest(req, res);
});
apiRouter.get("/user", async (req, res) => {
    handler.handleRequest(req, res);
});
apiRouter.put("/user", async (req, res) => {
    handler.handleRequest(req, res);
});
apiRouter.get("/user/:username", async (req, res) => {
    userHandler.handleRequest(req, res);
});
apiRouter.put("/user/:username", async (req, res) => {
    userHandler.handleRequest(req, res);
});
module.exports = apiRouter;
