// db.ts

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on("error", (err: Error) => console.error(`[🍃🔴MongoDB]: error ${err}`));
db.once("open", () => console.log("[🍃🟢MongoDB]: Connected"));
console.log("[🔃SERVER]: Connecting");

module.exports = db;
