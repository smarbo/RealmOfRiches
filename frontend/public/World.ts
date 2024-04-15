import { Boundary } from "./Boundary.js";
import { collisions } from "./Collisions.js";
import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { OtherPlayer } from "./OtherPlayer.js";
// @ts-ignore

const socket: Socket = io();
socket.emit("message", "Player joined.");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 1440;
canvas.height = 810;

const peopleCounter = document.getElementById("people") as HTMLHeadingElement;

const ctx = canvas.getContext("2d")!;

const map = new GameObject(ctx, { x: 0, y: 0 }, "assets/rormap.png");
const foreground = new GameObject(ctx, { x: 0, y: 0 }, "assets/foreground.png");

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 140) {
  collisionsMap.push(collisions.slice(i, i + 140));
}

const boundaries: Boundary[] = [];

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundaries.push(
        new Boundary(ctx, { x: j * Boundary.width, y: i * Boundary.height })
      );
    }
  });
});

let player = new Player(
  ctx,
  { x: 2135, y: 1720 },
  "assets/playerDown.png",
  1.5
);

let players: OtherPlayer[] = [];

socket.on("playerUpdate", (plr: Player) => {
  let img = "";
  switch (plr.lastKey) {
    case "w":
      img = "assets/playerUp.png";
      break;
    case "s":
      img = "assets/playerDown.png";
      break;
    case "a":
      img = "assets/playerLeft.png";
      break;
    case "d":
      img = "assets/playerRight.png";
      break;
  }
  players.push(new OtherPlayer(ctx, plr.pos, img, plr.frames));
});

function gameLoop() {
  requestAnimationFrame(gameLoop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(
    canvas.width / 2 - player.pos.x - player.img.width / 8,
    canvas.height / 2 - player.pos.y - player.img.height / 2
  );
  map.draw();

  players.forEach((plr) => {
    plr.animate();
    plr.draw();
  });

  peopleCounter.innerText = String(players.length + 1);

  player.update();
  player.animate();
  socket.emit("playerUpdate", { ...player });
  player.draw();

  foreground.draw();

  boundaries.forEach((b) => {
    // collision detection
    if (
      player.pos.x + player.width >= b.pos.x &&
      player.pos.x <= b.pos.x + b.width &&
      player.pos.y + player.height >= b.pos.y &&
      player.pos.y <= b.pos.y + b.height
    ) {
      if (player.lastKey === "w") {
        player.pos.y += 3;
      }
      if (player.lastKey === "a") {
        player.pos.x += 3;
      }
      if (player.lastKey === "s") {
        player.pos.y -= 3;
      }
      if (player.lastKey === "d") {
        player.pos.x -= 3;
      }
      console.log("Colliding");
    }

    players = [];
  });

  ctx.restore();
}

gameLoop();
