"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const pub = path_1.default.join(__dirname, "..", "public");
const router = (0, express_1.Router)();
const GET = (uri, name) => {
    router.get(uri, (req, res) => {
        res.sendFile(path_1.default.join(pub, name));
    });
};
GET("/", "index.html");
GET("/play", "play.html");
module.exports = router;
