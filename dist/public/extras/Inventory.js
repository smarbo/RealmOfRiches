import { GameObject } from "./GameObject.js";
import { Item, ItemTypes } from "./Item.js";
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
            this.item.obj.pos = tile.pos;
            this.item.obj.draw(48, 48);
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
    constructor(ctx) {
        this.ctx = ctx;
        this.tileRegular = new GameObject(this.ctx, { x: 2135, y: 1720 }, "assets/inventoryTile.png");
        this.tileSelected = new GameObject(this.ctx, { x: 2135, y: 1720 }, "assets/inventorySelected.png");
        this.quickAccess = Array(8)
            .fill(null)
            .map(() => new InvSlot(this.ctx));
        this.quickAccess[3].item = new Item(ctx, "Sapphire Sword", ItemTypes.Weapon, "assets/ironSword.png");
        this.quickAccess[1].item = new Item(ctx, "Health Potion", ItemTypes.Interactable, "assets/healthPotion.png");
        this.quickAccess[0].item = new Item(this.ctx, "Glow Sword", ItemTypes.Weapon, "assets/blessedSword.png");
    }
    draw(player) {
        const selectedSlot = this.quickAccess[this.selected];
        if (selectedSlot.item) {
            if (selectedSlot.item.type === ItemTypes.Weapon) {
                this.ctx.save();
                this.ctx.translate(player.mouse.x + player.width / 2, player.mouse.y + player.height / 2);
                this.ctx.rotate(player.mouseAngle + 0.785398);
                this.ctx.drawImage(selectedSlot.item.obj.img, -27, -72, 96, 96);
                this.ctx.fillStyle = "rgba(255,255,255,0.5)";
                this.ctx.restore();
            }
            else {
                this.ctx.drawImage(selectedSlot.item.obj.img, player.pos.x, player.pos.y, 96, 96);
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
