import express, { Express, Request, Response } from "express";
import * as http from "http";
import { Server, Socket } from "socket.io";

const app: Express = express();
const server: http.Server = http.createServer(app);
const io: Server = require("socket.io")(server);
const router = require("./router");
import path from "path";

const pub = path.join(__dirname, "..", "public");
console.log(pub);
const port = 3000;

app.use(express.static(path.join(pub, "extras")));

app.use(router);
app.use((req: Request, res: Response, next) => {
  res.status(404);
  res.sendFile(path.join(pub, "404.html"));
});

io.on("connection", (socket: Socket) => {
  console.log(`[SOCKET.${socket.id}]: Connected`);

  socket.on("playerUpdate", (player) => {
    socket.broadcast.emit("playerUpdate", player);
  });

  socket.on("message", (msg) => {
    console.log(`[SOCKET.${socket.id}]: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET.${socket.id}]: Disconnected`);
  });
});

server.listen(port, () => {
  console.log(`[SERVER]: Server is running on http://localhost:${port}`);
});
