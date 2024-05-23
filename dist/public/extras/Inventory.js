import { GameObject } from "./GameObject.js";
import { Item } from "./Item.js";
import { Player } from "./Player.js";
import { Sword } from "./Sword.js";
import { magnitude } from "./Vector.js";
export class InvSlot {
    ctx;
    item;
    constructor(ctx, item) {
        this.ctx = ctx;
        this.item = item;
    }
    draw(tile) {
        tile.draw();
        if (this.item) {
            let temp = this.item.obj.pos;
            this.item.obj.pos = tile.pos;
            this.item.obj.draw(48, 48);
            this.item.obj.pos = temp;
        }
    }
}
export class Inventory {
    ctx;
    selected = 0;
    quickAccess;
    storage = [[]];
    tileRegular;
    tileSelected;
    mouseAngle = 0;
    constructor(ctx, player) {
        this.ctx = ctx;
        this.ctx.canvas.addEventListener("mousedown", () => {
            if (this.quickAccess[this.selected].item?.obj instanceof Sword &&
                player.energy >= 1) {
                const sword = this.quickAccess[this.selected].item?.obj;
                sword.attacking = true;
            }
        });
        this.ctx.canvas.addEventListener("touchstart", () => {
            if (player instanceof Player) {
                if (this.quickAccess[this.selected].item?.obj instanceof Sword &&
                    player.energy >= 1) {
                    console.log(player.swordstickTouch);
                    const sword = this.quickAccess[this.selected].item?.obj;
                    sword.attacking = true;
                }
            }
        });
        this.ctx.canvas.addEventListener("mouseup", () => {
            if (this.quickAccess[this.selected].item?.obj instanceof Sword) {
                const sword = this.quickAccess[this.selected].item?.obj;
                sword.attacking = false;
            }
        });
        this.ctx.canvas.addEventListener("touchend", () => {
            if (this.quickAccess[this.selected].item?.obj instanceof Sword) {
                const sword = this.quickAccess[this.selected].item?.obj;
                sword.attacking = false;
            }
        });
        this.ctx.canvas.addEventListener("click", () => {
            const plr = player;
            const m = plr.mouse;
            const s = 48;
            for (let i = 0; i < this.quickAccess.length; i++) {
                this.tileRegular.pos.x =
                    player.pos.x - 170 + i * this.tileRegular.img.width;
                this.tileRegular.pos.y =
                    player.pos.y +
                        this.ctx.canvas.height / 2 +
                        32 -
                        this.tileRegular.img.height;
                const x = this.tileRegular.pos.x - this.tileRegular.img.width / 2;
                const y = this.tileRegular.pos.y - this.tileRegular.img.height / 2;
                if (m.x > x && m.x < x + s && m.y > y && m.y < y + s) {
                    this.selected = i;
                    console.log("selected");
                    break;
                }
            }
        });
        this.ctx.canvas.addEventListener("touchstart", () => {
            const plr = player;
            const m = plr.mouse;
            const s = 48;
            for (let i = 0; i < this.quickAccess.length; i++) {
                this.tileRegular.pos.x =
                    player.pos.x - 170 + i * this.tileRegular.img.width;
                this.tileRegular.pos.y =
                    player.pos.y +
                        this.ctx.canvas.height / 2 +
                        32 -
                        this.tileRegular.img.height;
                const x = this.tileRegular.pos.x - this.tileRegular.img.width / 2;
                const y = this.tileRegular.pos.y - this.tileRegular.img.height / 2;
                if (m.x > x && m.x < x + s && m.y > y && m.y < y + s) {
                    this.selected = i;
                    console.log("selected");
                    break;
                }
            }
        });
        this.tileRegular = new GameObject(this.ctx, { x: 2135, y: 1720 }, "assets/inventoryTile.png");
        this.tileSelected = new GameObject(this.ctx, { x: 2135, y: 1720 }, "assets/inventorySelected.png");
        this.quickAccess = Array(8)
            .fill(null)
            .map(() => new InvSlot(this.ctx));
        this.add("healthPotion");
        this.add("blessedSword");
        this.add("ironAxe");
        this.add("cookie");
    }
    add(id) {
        for (let i = 0; i < this.quickAccess.length; i++) {
            let slot = this.quickAccess[i];
            if (!slot.item) {
                slot.item = new Item(this.ctx, id);
                break;
            }
        }
    }
    draw(player) {
        this.ctx.imageSmoothingEnabled = false;
        const selectedSlot = this.quickAccess[this.selected];
        if (selectedSlot.item) {
            if (selectedSlot.item.obj instanceof Sword) {
                let pos = { x: 0, y: 0 };
                let dv = {
                    x: player.mouse.x - player.pos.x,
                    y: player.mouse.y - player.pos.y,
                };
                let d = magnitude(dv);
                if (!player.mobile) {
                    if (d > selectedSlot.item.obj.reach) {
                        dv.x = (dv.x / d) * selectedSlot.item.obj.reach;
                        dv.y = (dv.y / d) * selectedSlot.item.obj.reach;
                        pos.x = player.pos.x + dv.x + player.width / 2;
                        pos.y = player.pos.y + dv.y + player.height / 2;
                    }
                    else {
                        pos.x = player.mouse.x + player.width / 2;
                        pos.y = player.mouse.y + player.height / 2;
                    }
                }
                else {
                    pos = {
                        x: player.pos.x +
                            player.width / 2 +
                            Math.cos(player.mouseAngle) * selectedSlot.item.obj.reach,
                        y: player.pos.y +
                            player.height / 2 +
                            Math.sin(player.mouseAngle) * selectedSlot.item.obj.reach,
                    };
                }
                selectedSlot.item.obj.update(pos, player.mouseAngle + (45 * Math.PI) / 180);
                if (selectedSlot.item.obj.attacking) {
                    if (player.energy < 1)
                        selectedSlot.item.obj.attacking = false;
                    player.energy -= 0.2;
                }
                selectedSlot.item.obj.animate();
                selectedSlot.item.obj.draw();
            }
            else {
                this.ctx.drawImage(selectedSlot.item.obj.img, player.pos.x, player.pos.y, 96, 96);
                if (player.inputs.use) {
                    if ((selectedSlot.item.id = "healthPotion")) {
                        player.health += 15;
                        this.quickAccess[this.selected].item = undefined;
                    }
                }
            }
        }
        for (let i = 0; i < 8; i++) {
            if (i === this.selected) {
                this.tileSelected.pos.x =
                    player.pos.x - 170 + i * this.tileSelected.img.width;
                this.tileSelected.pos.y =
                    player.pos.y +
                        this.ctx.canvas.height / 2 +
                        32 -
                        this.tileSelected.img.height -
                        4;
                this.quickAccess[i].draw(this.tileSelected);
            }
            else {
                this.tileRegular.pos.x =
                    player.pos.x - 170 + i * this.tileRegular.img.width;
                this.tileRegular.pos.y =
                    player.pos.y +
                        this.ctx.canvas.height / 2 +
                        32 -
                        this.tileRegular.img.height;
                this.quickAccess[i].draw(this.tileRegular);
            }
        }
    }
}
/*

Make selected item be drawn under foreground objects -
separate function within inventory class to draw selected item, call this before foreground objects in world.ts

*/
