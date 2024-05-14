import { Boundary } from "./Boundary.js";
import { collisions } from "./Collisions.js";
import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { OtherPlayer } from "./OtherPlayer.js";
import { WorldItem } from "./WorldItem.js";
import { ItemTypes, Items } from "./Item.js";
import { Sword } from "./Sword.js";
import { Direction, Skeleton } from "./Skeleton.js";
import { Vector } from "./Vector.js";
// @ts-ignore

const socket: Socket = io();
let room = "";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.style.display = "none";
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const peopleCounter = document.getElementById("people") as HTMLHeadingElement;
peopleCounter.hidden = true;

const attackAnimation = new Image();
attackAnimation.src = "assets/attackAnimation.png";

const roomButton = document.getElementById("roomButton") as HTMLButtonElement;
const roomInput = document.getElementById("roomInput") as HTMLInputElement;
const userInput = document.getElementById("userInput") as HTMLInputElement;
const serverSelector = document.getElementById(
  "serverSelector"
) as HTMLDivElement;
const publicPrivate = document.getElementById(
  "publicPrivate"
) as HTMLInputElement;

publicPrivate.onchange = () => {
  if (publicPrivate.checked) {
    roomInput.disabled = false;
    roomInput.style.opacity = "100";
    userInput.style.transform = "translateY(0)";
  } else {
    roomInput.disabled = true;
    roomInput.style.opacity = "0";
    userInput.style.transform = "translateY(-40px)";
  }
};

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
let enemiesId: string[] = [];
let enemies: {
  [key: string]: Skeleton;
} = {};

function spawnEnemy(pos: Vector) {
  let skele = new Skeleton(ctx, pos, "assets/skeleDown.png", 3.5);

  enemiesId.push(skele.id);
  enemies[skele.id] = skele;
  socket.emit("enemySpawn", skele);
}

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
    players[plr.id].inventory = plr.inventory;
  }
});
// MAKE ENEMY SPAWN, ENEMY UPDATE, AND ENEMY DIE EVENTS
socket.on("enemySpawn", (e: Skeleton) => {
  let skele = new Skeleton(ctx, e.pos, "assets/skeleDown.png", 3.5, e.id);
  enemiesId.push(skele.id);
  enemies[skele.id] = skele;
});

socket.on("enemyUpdate", (e: Skeleton) => {
  enemies[e.id].aframes.val = e.aframes.val;
  enemies[e.id].aframes.tick = e.aframes.tick;
  enemies[e.id].pos = { ...e.pos };
  enemies[e.id].attacking = e.attacking;
  enemies[e.id].direction = e.direction;
  enemies[e.id].crumbs = e.crumbs;
});

socket.on("enemyDamage", (e: Skeleton) => {
  enemies[e.id].health = e.health;
});

socket.on("roomEnemies", (eIds: string[]) => {
  enemiesId = eIds;
  enemiesId.forEach((id) => {
    enemies[id] = new Skeleton(
      ctx,
      { x: 2135, y: 1720 },
      "assets/skeleDown.png",
      3.5,
      id
    );
  });
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

let worldItems: WorldItem[] = [];
let closestPlayer: OtherPlayer | Player;

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
      let plr = players[plrId];
      plr.animate();
      plr.draw();
      let slot = plr.inventory.quickAccess[plr.inventory.selected];
      if (slot.item) {
        if (slot.item.type === ItemTypes.Sword) {
          ctx.save();
          ctx.translate(slot.item.obj.pos.x, slot.item.obj.pos.y);
          ctx.rotate(slot.item.obj.rot);
          ctx.drawImage(Items[slot.item.id].image, -27, -72, 96, 96);
          const obj = slot.item.obj as Sword;
          if (obj.attacking) {
            ctx.drawImage(
              attackAnimation,
              obj.frames.val * 32,
              0,
              32,
              32,
              -27,
              -72,
              96,
              96
            );
          }
          ctx.restore();
        } else {
          ctx.drawImage(
            Items[slot.item.id].image,
            plr.pos.x,
            plr.pos.y,
            96,
            96
          );
        }
      }
    });
  }

  peopleCounter.innerText = String(playersList.length + 1);

  player.update();
  player.animate();
  socket.emit("playerUpdate", { ...player });
  worldItems.forEach((g, i) => {
    g.draw(64, 64);
    if (player.grabbing) {
      const grabbed = g.collect(player);
      if (grabbed) delete worldItems[i];
    }
  });
  if (enemiesId.length >= 1) {
    enemiesId.forEach((eId, i) => {
      let e = enemies[eId];
      if (e.health < 1) {
        delete enemies[eId];
        delete enemiesId[i];
        socket.emit("enemyKill", e);
        worldItems.push(new WorldItem(ctx, { ...e.pos }, "cookie"));
      }
      e.draw();

      if (playersList.length >= 1) {
        let minDistance = Number.MAX_VALUE;
        playersList.forEach((plrId) => {
          const plr = players[plrId];
          const distance = Math.sqrt(
            Math.pow(plr.pos.x - e.pos.x, 2) + Math.pow(plr.pos.y - e.pos.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestPlayer = plr;
          }

          const pd = Math.sqrt(
            Math.pow(player.pos.x - e.pos.x, 2) +
              Math.pow(plr.pos.y - e.pos.y, 2)
          );
          if (pd < minDistance) {
            minDistance = pd;
            closestPlayer = player;
          }
        });
      } else {
        closestPlayer = player;
      }
      e.ai(closestPlayer);
      e.update();
      socket.emit("enemyUpdate", e);
      let selected = player.inventory.quickAccess[player.inventory.selected];
      if (selected.item && selected.item.obj instanceof Sword) {
        if (
          selected.item.obj.collides(e, 64, 64, 96, 96) &&
          selected.item.obj.attacking
        ) {
          if (!selected.item.obj.hitting) {
            e.health -= 5;
            selected.item.obj.hitting = true;
            socket.emit("enemyDamage", e);
          }
        } else {
          selected.item.obj.hitting = false;
        }
      }
    });
  }
  player.draw();

  foreground.draw();
  player.inv();

  player.stats();
  boundaries.forEach((b) => {
    // collision detection for player
    if (enemiesId.length >= 1) {
      enemiesId.forEach((eId) => {
        let e = enemies[eId];
        if (
          e.pos.x + e.width >= b.pos.x &&
          e.pos.x <= b.pos.x + b.width &&
          e.pos.y + e.height >= b.pos.y &&
          e.pos.y + e.height / 2 <= b.pos.y + b.height
        ) {
          switch (e.direction) {
            case Direction.Down:
              e.pos.y -= e.speed;
              break;
            case Direction.Up:
              e.pos.y += e.speed;
              break;
            case Direction.Left:
              e.pos.x += e.speed;
              break;
            case Direction.Right:
              e.pos.x -= e.speed;
              break;
          }
        }
      });
    }

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
  if (userInput.value != "") {
    player = new Player(
      ctx,
      { x: 2135, y: 1720 },
      "assets/playerDown.png",
      spawnEnemy,
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

    player.id = socket.id;
    worldContainer.hidden = true;
    room = roomInput.value;
    canvas.style.display = "block";
    peopleCounter.hidden = false;
    socket.emit("message", "Player joined.");
    if (publicPrivate.checked && roomInput.value != "") {
      socket.emit("joinWorld", room);
    } else if (!publicPrivate.checked) {
      socket.emit("joinPublic");
    }

    socket.emit("playerJoin", player);

    requestAnimationFrame(gameLoop);
  }
};
