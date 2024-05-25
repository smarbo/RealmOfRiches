import express, { Express, Request, Response, Router } from "express";
import path from "path";
import ApiHandler from "./apihandler";
import { IUser } from "./models/userModel";
import { Connection, Model } from "mongoose";

const pub = path.join(__dirname, "..", "public");
const router = Router();
router.use(express.json());

require("dotenv");
const User: Model<IUser> = require("./models/userModel.js");
require("./db.js");
const bcrypt = require("bcryptjs");

// PAGES ROUTER
const GET = (uri: string, name: string) => {
  router.get(uri, (req: Request, res: Response) => {
    res.sendFile(path.join(pub, name));
  });
};

GET("/", "index.html");
GET("/play", "play.html");
GET("/auth", "auth.html");

// API ROUTER
const handler = new ApiHandler({
  post: async (req: Request, res: Response) => {
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
      } catch (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json({
        message: `Successfully created ${
          req.body.username
        }'s account, with the email ${req.body.email} and he ${
          true ? "is" : "isn't"
        } eligible for a drop.`,
      });
    } else {
      return res.status(400).json({ message: "Invalid request." });
    }
  },
  authKeys: [process.env.AUTH_KEY!],
});

router.post("/api", (req: Request, res: Response) => {
  handler.handleRequest(req, res);
});

module.exports = router;
