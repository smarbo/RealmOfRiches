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

let roomsEnemies: { [key: string]: string[] } = {};
let roomHosts: { [room: string]: string } = {};
let publicRooms: string[] = [];

io.on("connection", (socket: Socket) => {
  console.log(`[SOCKET.${socket.id}]: Connected`);

  socket.on("playerUpdate", (player) => {
    if (Array.from(socket.rooms).filter((r) => r != socket.id)[0]) {
      socket.broadcast
        .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
        .emit("playerUpdate", player);
    }
  });

  socket.on("enemySpawn", (e) => {
    let room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];
    console.log(`[ROOM.${room}]: ENEMY CREATED`);
    socket.broadcast.to(room).emit("enemySpawn", e);
    if (!roomsEnemies[room]) {
      roomsEnemies[room] = [];
    }
    roomsEnemies[room].push(e.id);
  });

  socket.on("enemyUpdate", (e) => {
    let room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];

    if (roomHosts[room] === socket.id) {
      socket.broadcast.to(room).emit("enemyUpdate", e);
    }
  });

  socket.on("enemyDamage", (e) => {
    socket.broadcast
      .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
      .emit("enemyDamage", e);
  });

  socket.on("enemyKill", (e) => {
    let room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];
    console.log(`[ROOM.${room}]: ENEMY KILLED`);
    roomsEnemies[room] = roomsEnemies[room].filter((i) => i !== e.id);
  });

  socket.on("playerJoin", (player) => {
    socket.broadcast
      .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
      .emit("playerJoin", player);
    // Send the new player all the players in that room before him
    const room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];
    const roomData = io.sockets.adapter.rooms.get(room);
    // filter room array to not include the player, only others.
    if (roomData) {
      socket.emit(
        "roomPlayers",
        Array.from(roomData).filter((id) => id !== socket.id)
      );
      if (Array.from(roomData).filter((id) => id !== socket.id).length < 1) {
        roomHosts[room] = socket.id;
        console.log(`${socket.id} is now the host of ${room}`);
      }
    }

    if (roomsEnemies[room]) {
      socket.emit("roomEnemies", roomsEnemies[room]);
    }

    // SEND THE PLAYER ALL PLAYER IDS OF THAT ROOM, AND HE WILL AUTOMATICALLY ACCEPT PLAYERUPDATES
  });

  socket.on("joinWorld", (world) => {
    socket.join(world);
    console.log(`[SOCKET.${socket.id}]: Joined ${world}`);
  });

  socket.on("joinPublic", () => {
    const roomData = io.sockets.adapter.rooms.get(
      publicRooms[publicRooms.length - 1]
    );

    if (
      publicRooms.length < 1 ||
      (roomData && Array.from(roomData).length >= 6)
    ) {
      publicRooms.push(`PUBLIC_${publicRooms.length + 1}`);
    }

    socket.join(publicRooms[publicRooms.length - 1]);
    console.log(
      `[SOCKET.${socket.id}]: Joined ${publicRooms[publicRooms.length - 1]}`
    );
    console.log(publicRooms);
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
