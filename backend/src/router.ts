import express, { Express, Request, Response, Router } from "express";
import path from "path";

const pub = path.join(__dirname, "..", "public");
const router = Router();
router.use(express.json());

// PAGES ROUTER
const GET = (uri: string, name: string) => {
  router.get(uri, (req: Request, res: Response) => {
    res.sendFile(path.join(pub, name));
    res.cookie("ror_auth_key", process.env.AUTH_KEY, {
      httpOnly: true,
    });
  });
};

GET("/", "index.html");
GET("/play", "play.html");
GET("/auth", "auth.html");
GET("/drop", "drop.html");

module.exports = router;
