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
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const app = (0, express_1.default)();
const server = http.createServer(app);
const io = require("socket.io")(server);
const router = require("./router");
const path_1 = __importDefault(require("path"));
const pub = path_1.default.join(__dirname, "..", "public");
console.log(pub);
const port = 3000;
app.use(express_1.default.static(path_1.default.join(pub, "extras")));
app.use(router);
app.use((req, res, next) => {
    res.status(404);
    res.sendFile(path_1.default.join(pub, "404.html"));
});
let roomsEnemies = {};
let roomHosts = {};
let publicRooms = [];
io.on("connection", (socket) => {
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
    socket.on("routineSpawn", (e) => {
        let room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];
        if (roomHosts[room] === socket.id) {
            console.log(`[ROOM.${room}]: ENEMY ROUTINE SPAWNED`);
            socket.broadcast.to(room).emit("enemySpawn", e);
            if (!roomsEnemies[room]) {
                roomsEnemies[room] = [];
            }
            roomsEnemies[room].push(e.id);
        }
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
            socket.emit("roomPlayers", Array.from(roomData).filter((id) => id !== socket.id));
            if (Array.from(roomData).filter((id) => id !== socket.id).length < 1) {
                roomHosts[room] = socket.id;
                socket.emit("isHost", true);
                console.log(`${socket.id} is now the host of ${room}`);
            }
            else {
                socket.emit("isHost", false);
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
        const roomData = io.sockets.adapter.rooms.get(publicRooms[publicRooms.length - 1]);
        if (publicRooms.length < 1 ||
            (roomData && Array.from(roomData).length >= 6)) {
            publicRooms.push(`PUBLIC_${publicRooms.length + 1}`);
        }
        socket.join(publicRooms[publicRooms.length - 1]);
        console.log(`[SOCKET.${socket.id}]: Joined ${publicRooms[publicRooms.length - 1]}`);
        console.log(publicRooms);
    });
    socket.on("message", (msg) => {
        console.log(`[SOCKET.${socket.id}]: ${msg}`);
    });
    socket.on("disconnecting", () => {
        const room = Array.from(socket.rooms).filter((r) => r != socket.id)[0];
        const roomData = io.sockets.adapter.rooms.get(room);
        if (roomData) {
            if (Array.from(roomData).length === 1) {
                roomsEnemies[room] = [];
                delete roomHosts[room];
            }
            else if (Array.from(roomData).length > 1) {
                roomHosts[room] = Array.from(roomData)[1];
            }
        }
        socket.broadcast
            .to(Array.from(socket.rooms).filter((r) => r != socket.id)[0])
            .emit("playerLeave", socket.id);
        socket.to(roomHosts[room]).emit("isHost", true);
    });
    socket.on("disconnect", () => {
        console.log(`[SOCKET.${socket.id}]: Disconnected`);
    });
});
server.listen(port, () => {
    console.log(`[SERVER]: Server is running on http://localhost:${port}`);
});
