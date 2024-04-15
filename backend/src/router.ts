import express, { Express, Request, Response, Router } from "express";
import path from "path";

const pub = path.join(__dirname, "..", "public");
const router = Router();

const GET = (uri: string, name: string) => {
  router.get(uri, (req: Request, res: Response) => {
    res.sendFile(path.join(pub, name));
  });
};

GET("/", "index.html");
GET("/play", "play.html");

module.exports = router;
