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
const path_1 = __importDefault(require("path"));
const apihandler_1 = __importDefault(require("./apihandler"));
const pub = path_1.default.join(__dirname, "..", "public");
const router = (0, express_1.Router)();
router.use(express_1.default.json());
require("dotenv");
const User = require("./models/userModel.js");
require("./db.js");
const bcrypt = require("bcryptjs");
// PAGES ROUTER
const GET = (uri, name) => {
    router.get(uri, (req, res) => {
        res.sendFile(path_1.default.join(pub, name));
    });
};
GET("/", "index.html");
GET("/play", "play.html");
GET("/auth", "auth.html");
// API ROUTER
const handler = new apihandler_1.default({
    post: async (req, res) => {
        console.log("[API]: Recieved POST");
        if (req.body.username && req.body.email && req.body.password) {
            try {
                const hash = await bcrypt.hash(req.body.password, 10);
                await User.create({
                    name: req.body.username,
                    password: hash,
                    email: req.body.email,
                    balance: 0,
                    dropEligible: true,
                    inventory: [],
                });
            }
            catch (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({
                message: `Successfully created ${req.body.username}'s account, with the email ${req.body.email} and he ${true ? "is" : "isn't"} eligible for a drop.`,
            });
        }
        else {
            return res.status(400).json({ message: "Invalid request." });
        }
    },
    authKeys: [process.env.AUTH_KEY],
});
router.post("/api", (req, res) => {
    handler.handleRequest(req, res);
});
module.exports = router;
