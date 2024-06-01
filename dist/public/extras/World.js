import { rorMapCollisions } from "./Collisions.js";
import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { OtherPlayer } from "./OtherPlayer.js";
import { WorldItem } from "./WorldItem.js";
import { Item, ItemTypes, Items } from "./Item.js";
import { Sword } from "./Sword.js";
import { Direction, Skeleton } from "./Skeleton.js";
import { State } from "./State.js";
import { Button, ButtonType } from "./Button.js";
import { Map } from "./Map.js";
const retrievePlayer = async () => {
    try {
        const res = await fetch(`/api/user/${localStorage.getItem("username")}`);
        const r = await res.json();
        localStorage.setItem("balance", r.balance);
        localStorage.setItem("dropEligible", r.dropEligible);
        localStorage.setItem("dropStreak", r.dropStreak);
        localStorage.setItem("email", r.email);
        localStorage.setItem("inventory", JSON.stringify(r.inventory));
        localStorage.setItem("username", r.name);
        const inv = JSON.parse(localStorage.getItem("inventory"));
        player.inventory.quickAccess.forEach((s, i) => {
            if (inv[i] !== "") {
                s.item = new Item(ctx, inv[i]);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
//@ts-ignore
const socket = io();
let room = "";
let state = State.Idle;
const canvas = document.getElementById("canvas");
canvas.style.display = "none";
canvas.width = screen.width;
canvas.height = screen.height;
const cursorImg = new Image();
cursorImg.src = "/assets/cursor.png";
const attackAnimation = new Image();
attackAnimation.src = "/assets/attackAnimation.png";
const roomButton = document.getElementById("roomButton");
const footer = document.getElementById("footer");
const usernameLabel = document.getElementById("usernameLabel");
const desktopChoice = document.getElementById("choiceComputer");
const mobileChoice = document.getElementById("choiceMobile");
const choiceContainer = document.getElementById("deviceContainer");
const buttonChoice = document.getElementById("choiceConfirm");
const backLink = document.getElementById("back");
const roomInput = document.getElementById("roomInput");
const serverSelector = document.getElementById("serverSelector");
const publicPrivate = document.getElementById("publicPrivate");
if (!localStorage.getItem("username")) {
    window.location.href = "/auth/";
}
else {
    usernameLabel.innerText = `You are joining as '${localStorage.getItem("username")}'`;
}
var Choice;
(function (Choice) {
    Choice[Choice["Mobile"] = 0] = "Mobile";
    Choice[Choice["Desktop"] = 1] = "Desktop";
})(Choice || (Choice = {}));
let selected;
mobileChoice.onclick = () => {
    selected = Choice.Mobile;
    mobileChoice.style.background = "#555";
    desktopChoice.style.background = "#333";
};
desktopChoice.onclick = () => {
    selected = Choice.Desktop;
    desktopChoice.style.background = "#555";
    mobileChoice.style.background = "#333";
};
buttonChoice.onclick = () => {
    if (selected !== undefined) {
        choiceContainer.style.display = "none";
        choiceContainer.hidden = true;
        worldContainer.style.display = "flex";
        worldContainer.hidden = false;
    }
};
publicPrivate.onchange = () => {
    if (publicPrivate.checked) {
        roomInput.disabled = false;
        roomInput.style.opacity = "100";
    }
    else {
        roomInput.disabled = true;
        roomInput.style.opacity = "0";
    }
};
const worldContainer = document.getElementById("worldContainer");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
let mouse = { x: 0, y: 0 };
const rorMap = new Map(ctx, "/assets/rormap.png", "/assets/foreground.png", rorMapCollisions, 140, { x: 2135, y: 1720 });
const pauseTitle = new GameObject(ctx, { x: 0, y: 0 }, "/assets/pauseTitle.png");
const slainTitle = new GameObject(ctx, { x: 0, y: 0 }, "/assets/slainTitle.png");
const buttons = [];
const deathButtons = [];
const button = (pos, text, fun, type, overlay) => {
    if (type === ButtonType.Settings) {
        settingsButtons.push(new Button(ctx, pos, text, 3, () => {
            player.inputs.mouse = false;
            fun();
        }, overlay));
    }
    else if (type === ButtonType.Menu) {
        buttons.push(new Button(ctx, pos, text, 3, () => {
            player.inputs.mouse = false;
            fun();
        }, overlay));
    }
    else {
        deathButtons.push(new Button(ctx, pos, text, 3, () => {
            player.inputs.mouse = false;
            fun();
        }, overlay));
    }
};
let player;
let players = {};
let playersList = [];
let enemiesId = [];
let enemies = {};
function routineSpawn(pos) {
    if (player.host && enemiesId.length < 5) {
        let skele = new Skeleton(ctx, { ...player.map.spawnPoint }, "/assets/skeleDown.png", 3.5);
        enemiesId.push(skele.id);
        enemies[skele.id] = skele;
        socket.emit("routineSpawn", skele);
    }
}
//* SOCKET CONNECTIONS & UPDATES
socket.on("isHost", (h) => {
    player.host = h;
});
socket.on("playerUpdate", (plr) => {
    let img = "";
    switch (plr.lastKey) {
        case "w":
            img = "/assets/playerUp.png";
            break;
        case "s":
            img = "/assets/playerDown.png";
            break;
        case "a":
            img = "/assets/playerLeft.png";
            break;
        case "d":
            img = "/assets/playerRight.png";
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
socket.on("enemySpawn", (e) => {
    let skele = new Skeleton(ctx, e.pos, "/assets/skeleDown.png", 3.5, e.id);
    enemiesId.push(skele.id);
    enemies[skele.id] = skele;
});
socket.on("enemyUpdate", (e) => {
    enemies[e.id].aframes.val = e.aframes.val;
    enemies[e.id].aframes.tick = e.aframes.tick;
    enemies[e.id].pos = { ...e.pos };
    enemies[e.id].attacking = e.attacking;
    enemies[e.id].direction = e.direction;
    enemies[e.id].crumbs = e.crumbs;
});
socket.on("enemyDamage", (e) => {
    enemies[e.id].health = e.health;
});
socket.on("roomEnemies", (eIds) => {
    enemiesId = eIds;
    enemiesId.forEach((id) => {
        enemies[id] = new Skeleton(ctx, { ...player.map.spawnPoint }, "/assets/skeleDown.png", 3.5, id);
    });
});
socket.on("roomPlayers", (ids) => {
    playersList = ids;
    playersList.forEach((id) => {
        players[id] = new OtherPlayer(ctx, player.pos, "/assets/playerDown.png", player.frames, player.username);
    });
});
socket.on("playerJoin", (plr) => {
    let img = "";
    switch (plr.lastKey) {
        case "w":
            img = "/assets/playerUp.png";
            break;
        case "s":
            img = "/assets/playerDown.png";
            break;
        case "a":
            img = "/assets/playerLeft.png";
            break;
        case "d":
            img = "/assets/playerRight.png";
            break;
    }
    players[plr.id] = new OtherPlayer(ctx, plr.pos, img, plr.frames, plr.username);
    playersList.push(plr.id);
});
socket.on("playerLeave", (plrId) => {
    playersList = playersList.filter((p) => p !== plrId);
    delete players[plrId];
});
let lastTime = 0;
const frameDuration = 1000 / 60; // 60 fps
let worldItems = [];
let closestPlayer;
let settings = false;
const cursor = () => {
    if (state === State.Running) {
        mouse = {
            x: player.mouse.x,
            y: player.mouse.y + 12,
        };
        ctx.drawImage(cursorImg, mouse.x, mouse.y, 48, 48);
    }
    else if (state === State.Paused || state === State.Dead) {
        mouse = {
            x: player.mouseOffset.x + canvas.width / 2 - 24,
            y: player.mouseOffset.y + canvas.height / 2 - 24,
        };
        ctx.drawImage(cursorImg, mouse.x, mouse.y, 48, 48);
    }
};
const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2 - player.pos.x - player.img.width / 8, canvas.height / 2 - player.pos.y - player.img.height / 2);
    player.map.drawBase();
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
                    const obj = slot.item.obj;
                    if (obj.attacking) {
                        ctx.drawImage(attackAnimation, obj.frames.val * 32, 0, 32, 32, -27, -72, 96, 96);
                    }
                    ctx.restore();
                }
                else {
                    ctx.drawImage(Items[slot.item.id].image, plr.pos.x, plr.pos.y, 96, 96);
                }
            }
        });
    }
    player.update(state);
    if (player.health < 1) {
        state = State.Dead;
    }
    if (player.inputs.pause) {
        player.inputs.pause = false;
        if (state === State.Running)
            state = State.Paused;
        else if (state === State.Paused)
            state = State.Running;
    }
    player.animate();
    socket.emit("playerUpdate", { ...player });
    worldItems.forEach((g, i) => {
        g.draw(64, 64);
        if (player.grabbing) {
            const grabbed = g.collect(player);
            if (grabbed)
                delete worldItems[i];
        }
    });
    if (enemiesId.length >= 1) {
        enemiesId.forEach((eId, i) => {
            let e = enemies[eId];
            if (e.health < 1) {
                delete enemies[eId];
                enemiesId.splice(enemiesId.indexOf(eId), 1);
                socket.emit("enemyKill", e);
                worldItems.push(new WorldItem(ctx, { ...e.pos }, "cookie"));
                worldItems.push(new WorldItem(ctx, { x: e.pos.x + 20, y: e.pos.y }, "healthPotion"));
            }
            e.draw();
            if (playersList.length >= 1) {
                let minDistance = Number.MAX_VALUE;
                playersList.forEach((plrId) => {
                    const plr = players[plrId];
                    const distance = Math.sqrt(Math.pow(plr.pos.x - e.pos.x, 2) + Math.pow(plr.pos.y - e.pos.y, 2));
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPlayer = plr;
                    }
                    const pd = Math.sqrt(Math.pow(player.pos.x - e.pos.x, 2) +
                        Math.pow(plr.pos.y - e.pos.y, 2));
                    if (pd < minDistance) {
                        minDistance = pd;
                        closestPlayer = player;
                    }
                });
            }
            else {
                closestPlayer = player;
            }
            e.ai(closestPlayer);
            e.update();
            socket.emit("enemyUpdate", e);
            let selected = player.inventory.quickAccess[player.inventory.selected];
            if (selected.item && selected.item.obj instanceof Sword) {
                if (selected.item.obj.collides(e, 64, 64, 96, 96) &&
                    selected.item.obj.attacking) {
                    if (!selected.item.obj.hitting) {
                        e.health -= 5;
                        selected.item.obj.hitting = true;
                        socket.emit("enemyDamage", e);
                    }
                }
                else {
                    selected.item.obj.hitting = false;
                }
            }
        });
    }
    player.draw(state);
    player.map.drawFore();
    player.inv(state);
    player.stats(state);
    player.map.boundaries.forEach((b) => {
        // collision detection for player
        if (enemiesId.length >= 1) {
            enemiesId.forEach((eId) => {
                let e = enemies[eId];
                if (e.pos.x + e.width >= b.pos.x &&
                    e.pos.x <= b.pos.x + b.width &&
                    e.pos.y + e.height >= b.pos.y &&
                    e.pos.y + e.height / 2 <= b.pos.y + b.height) {
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
        if (player.pos.x + player.width > b.pos.x &&
            player.pos.x < b.pos.x + b.width &&
            player.pos.y + player.height > b.pos.y &&
            player.pos.y + player.height / 2 < b.pos.y + b.height) {
            if (player.mobile) {
                if (player.lastKey === "w") {
                    player.colliding.up = true;
                }
                else if (player.lastKey === "a") {
                    player.colliding.left = true;
                }
                else if (player.lastKey === "s") {
                    player.colliding.down = true;
                }
                else if (player.lastKey === "d") {
                    player.colliding.right = true;
                }
                if (player.colliding.up) {
                    player.pos.y += player.speed;
                    player.colliding.up = false;
                    player.lastKey = "w";
                }
                if (player.colliding.left) {
                    player.pos.x += player.speed;
                    player.colliding.left = false;
                    player.lastKey = "a";
                }
                if (player.colliding.down) {
                    player.pos.y -= player.speed;
                    player.colliding.down = false;
                    player.lastKey = "s";
                }
                if (player.colliding.right) {
                    player.pos.x -= player.speed;
                    player.colliding.right = false;
                    player.lastKey = "d";
                }
            }
            else {
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
        }
    });
    ctx.fillText(`${localStorage.getItem("balance")} coins.`, screenX(25), screenY(25));
    cursor();
    ctx.restore();
};
function screenX(x) {
    return x + player.pos.x + player.width / 2 - canvas.width / 2;
}
function screenY(y) {
    return y + player.pos.y + player.height / 2 - canvas.height / 2;
}
function screenPos(pos) {
    return {
        x: screenX(pos.x),
        y: screenY(pos.y),
    };
}
const click = (btn) => {
    return btn.hover(mouse) && player.inputs.mouse;
};
const hover = (btn) => {
    return btn.hover(mouse);
};
const settingsButtons = [];
const pauseMenu = () => {
    gameLoop();
    ctx.fillStyle = "rgba(84,84,59,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pauseTitle.pos = {
        x: canvas.width / 2 - pauseTitle.img.width / 4,
        y: canvas.height / 2 - pauseTitle.img.height / 4 - 200,
    };
    pauseTitle.draw(pauseTitle.img.width / 2, pauseTitle.img.height / 2);
    ctx.font = "30px Poetsen One";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    if (settings) {
        ctx.fillText("Settings", canvas.width / 2, canvas.height / 2 - 160);
        settingsButtons.forEach((b) => {
            if (hover(b))
                b.drawHover();
            else
                b.draw();
            if (click(b))
                b.fun();
        });
    }
    else {
        ctx.fillText("Game Menu", canvas.width / 2, canvas.height / 2 - 160);
        buttons.forEach((b) => {
            if (hover(b))
                b.drawHover();
            else
                b.draw();
            if (click(b))
                b.fun();
        });
    }
    cursor();
};
const deathScreen = () => {
    gameLoop();
    slainTitle.pos = {
        x: canvas.width / 2 - slainTitle.img.width / 2,
        y: canvas.height / 2 - slainTitle.img.height / 2,
    };
    slainTitle.draw();
    if (hover(deathButtons[0]))
        deathButtons[0].drawHover();
    else
        deathButtons[0].draw();
    if (click(deathButtons[0]))
        deathButtons[0].fun();
    cursor();
};
//* Main game loop
function handleState(timestamp) {
    const deltaTime = timestamp - lastTime;
    if (deltaTime < frameDuration) {
        requestAnimationFrame(handleState);
        return;
    }
    lastTime = timestamp;
    switch (state) {
        case State.Running:
            gameLoop();
            break;
        case State.Paused:
            pauseMenu();
            break;
        case State.Dead:
            deathScreen();
            break;
    }
    requestAnimationFrame(handleState);
}
//* Join lobby button - start game
roomButton.onclick = () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    if (localStorage.getItem("username") !== undefined) {
        player = new Player(ctx, "/assets/playerDown.png", routineSpawn, 4, selected === Choice.Mobile ? true : false, {
            max: 4,
            val: 0,
            tick: 0,
            imgs: {
                up: new Image(),
                left: new Image(),
                right: new Image(),
                down: new Image(),
            },
        }, localStorage.getItem("username"));
        retrievePlayer();
        player.id = socket.id;
        worldContainer.hidden = true;
        worldContainer.style.display = "none";
        navbar.style.display = "none";
        footer.hidden = true;
        footer.style.display = "none";
        backLink.hidden = true;
        backLink.style.display = "none";
        room = roomInput.value;
        canvas.style.display = "block";
        window.scrollTo(0, 1);
        socket.emit("message", "Player joined.");
        if (publicPrivate.checked && roomInput.value != "") {
            socket.emit("joinWorld", room);
        }
        else if (!publicPrivate.checked) {
            socket.emit("joinPublic");
        }
        button({
            x: canvas.width / 2 - Button.width - 2,
            y: canvas.height / 2 - 120,
        }, "BACK TO GAME", () => {
            state = State.Running;
        }, ButtonType.Menu);
        button({ x: canvas.width / 2 + 2, y: canvas.height / 2 - 120 }, "SETTINGS", () => {
            settings = true;
        }, ButtonType.Menu);
        button({ x: canvas.width / 2 + 2, y: canvas.height / 2 - 120 + 48 + 24 }, "LEAVE WORLD", () => {
            window.location.href = "/";
        }, ButtonType.Menu);
        button({ x: canvas.width / 2 - Button.width / 2, y: canvas.height / 2 - 120 }, "BACK TO MENU", () => {
            settings = false;
        }, ButtonType.Settings);
        button({
            x: canvas.width / 2 - Button.width / 2,
            y: canvas.height / 2 + Button.height + 10,
        }, "ACCEPT YOUR FATE", () => {
            window.location.href = "/";
        }, ButtonType.Death, "rgba(200,80,80,0.5)");
        socket.emit("playerJoin", player);
        state = State.Paused;
        requestAnimationFrame(handleState);
    }
};
