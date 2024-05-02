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
    if (Array.from(socket.rooms).filter((r) => r != socket.id)[0]) {
      socket.broadcast
        .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
        .emit("playerUpdate", player);
    }
  });

  socket.on("playerJoin", (player) => {
    socket.broadcast
      .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
      .emit("playerJoin", player);
    // Send the new player all the players in that room before him
    const roomData = io.sockets.adapter.rooms.get(
      Array.from(socket.rooms).filter((r) => r != socket.id)[0]
    );
    // filter room array to not include the player, only others.
    if (roomData) {
      socket.emit(
        "roomPlayers",
        Array.from(roomData).filter((id) => id !== socket.id)
      );
    }

    // SEND THE PLAYER ALL PLAYER IDS OF THAT ROOM, AND HE WILL AUTOMATICALLY ACCEPT PLAYERUPDATES
  });

  socket.on("joinWorld", (world) => {
    socket.join(world);
    console.log(Array.from(socket.rooms).filter((r) => r != socket.id)[0]);
  });

  socket.on("message", (msg) => {
    console.log(`[SOCKET.${socket.id}]: ${msg}`);
  });
  socket.on("disconnecting", () => {
    socket.broadcast
      .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
      .emit("playerLeave", socket.id);
  });
  socket.on("disconnect", () => {
    console.log(`[SOCKET.${socket.id}]: Disconnected`);
  });
});

server.listen(port, () => {
  console.log(`[SERVER]: Server is running on http://localhost:${port}`);
});
