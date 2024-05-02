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
io.on("connection", (socket) => {
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
        const roomData = io.sockets.adapter.rooms.get(Array.from(socket.rooms).filter((r) => r != socket.id)[0]);
        // filter room array to not include the player, only others.
        if (roomData) {
            socket.emit("roomPlayers", Array.from(roomData).filter((id) => id !== socket.id));
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
