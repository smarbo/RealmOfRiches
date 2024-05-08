import { Boundary } from "./Boundary.js";
import { collisions } from "./Collisions.js";
import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { OtherPlayer } from "./OtherPlayer.js";
import { WorldItem } from "./WorldItem.js";
import { ItemTypes } from "./Item.js";
// @ts-ignore

const socket: Socket = io();
let room = "";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.style.display = "none";
canvas.width = 1440;
canvas.height = 810;

const peopleCounter = document.getElementById("people") as HTMLHeadingElement;
peopleCounter.hidden = true;

const roomButton = document.getElementById("roomButton") as HTMLButtonElement;
const roomInput = document.getElementById("roomInput") as HTMLInputElement;
const userInput = document.getElementById("userInput") as HTMLInputElement;
const worldContainer = document.getElementById(
  "worldContainer"
) as HTMLDivElement;

const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

const map = new GameObject(ctx, { x: 0, y: 0 }, "assets/rormap.png");
const foreground = new GameObject(ctx, { x: 0, y: 0 }, "assets/foreground.png");

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 140) {
  collisionsMap.push(collisions.slice(i, i + 140));
}

const boundaries: Boundary[] = [];

collisionsMap.forEach((row, i) => {
  row.forEach((symbol: number, j: number) => {
    if (symbol === 1025) {
      boundaries.push(
        new Boundary(ctx, { x: j * Boundary.width, y: i * Boundary.height })
      );
    }
  });
});

let player: Player;

let players: {
  [key: string]: OtherPlayer;
} = {};

let playersList: string[] = [];

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
  } // if player is already connected
  if (playersList.includes(plr.id)) {
    players[plr.id].pos = plr.pos;
    players[plr.id].img.src = img;
    players[plr.id].frames = plr.frames;
    players[plr.id].username = plr.username;
    players[plr.id].lastKey = plr.lastKey;
  }
});

socket.on("roomPlayers", (ids: string[]) => {
  playersList = ids;
  playersList.forEach((id) => {
    players[id] = new OtherPlayer(
      ctx,
      player.pos,
      "assets/playerDown.png",
      player.frames,
      player.username
    );
  });
});

socket.on("playerJoin", (plr: Player) => {
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
  players[plr.id] = new OtherPlayer(
    ctx,
    plr.pos,
    img,
    plr.frames,
    plr.username
  );
  playersList.push(plr.id);
});

socket.on("playerLeave", (plrId: string) => {
  playersList = playersList.filter((p) => p !== plrId);
  delete players[plrId];
});

let lastTime = 0;
const frameDuration = 1000 / 60; // 60 fps

let grabbables: WorldItem[] = [];

function gameLoop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  if (deltaTime < frameDuration) {
    requestAnimationFrame(gameLoop);
    return;
  }
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(
    canvas.width / 2 - player.pos.x - player.img.width / 8,
    canvas.height / 2 - player.pos.y - player.img.height / 2
  );
  map.draw();

  if (playersList.length >= 1) {
    playersList.forEach((plrId) => {
      players[plrId].animate();
      players[plrId].draw();
    });
  }

  peopleCounter.innerText = String(playersList.length + 1);

  player.update();
  player.animate();
  socket.emit("playerUpdate", { ...player });
  grabbables.forEach((g, i) => {
    g.draw(64, 64);
    if (player.grabbing) {
      const grabbed = g.collect(player);
      if (grabbed) delete grabbables[i];
    }
  });
  player.draw();

  foreground.draw();
  player.inv();
  player.stats();
  boundaries.forEach((b) => {
    // collision detection
    if (
      player.pos.x + player.width >= b.pos.x &&
      player.pos.x <= b.pos.x + b.width &&
      player.pos.y + player.height >= b.pos.y &&
      player.pos.y + player.height / 2 <= b.pos.y + b.height
    ) {
      if (player.lastKey === "w") {
        player.pos.y += player.speed;
      }
      if (player.lastKey === "a") {
        player.pos.x += player.speed;
      }
      if (player.lastKey === "s") {
        player.pos.y -= player.speed;
      }
      if (player.lastKey === "d") {
        player.pos.x -= player.speed;
      }
    }
  });

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

roomButton.onclick = () => {
  if (roomInput.value != "" && userInput.value != "") {
    player = new Player(
      ctx,
      { x: 2135, y: 1720 },
      "assets/playerDown.png",
      4,
      {
        max: 4,
        val: 0,
        tick: 0,
        imgs: {
          up: new Image(),
          left: new Image(),
          right: new Image(),
          down: new Image(),
        },
      },
      userInput.value
    );

    grabbables.push(
      new WorldItem(
        ctx,
        { ...player.pos },
        "assets/rustySword.png",
        "Rusty Sword",
        ItemTypes.Sword
      )
    );
    player.id = socket.id;
    worldContainer.hidden = true;
    room = roomInput.value;
    canvas.style.display = "block";
    peopleCounter.hidden = false;
    socket.emit("message", "Player joined.");
    socket.emit("joinWorld", room);

    socket.emit("playerJoin", player);

    requestAnimationFrame(gameLoop);
  }
};
