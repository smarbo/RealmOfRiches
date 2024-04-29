import { GameObject } from "./GameObject.js";
import { Item, ItemTypes } from "./Item.js";
import { Player } from "./Player.js";
import { Vector } from "./Vector.js";

export class InvSlot {
  constructor(public ctx: CanvasRenderingContext2D, public item?: Item) {}
  draw(tile: GameObject) {
    tile.draw();
    if (this.item) {
      this.item.tile.pos = tile.pos;
      this.item.tile.draw(48, 48);
    }
  }
}

export class Inventory {
  selected = 0;
  quickAccess: InvSlot[];
  storage: InvSlot[][] = [[]];
  tileRegular: GameObject;
  tileSelected: GameObject;
  constructor(public ctx: CanvasRenderingContext2D) {
    this.tileRegular = new GameObject(
      this.ctx,
      { x: 2135, y: 1720 },
      "assets/inventoryTile.png"
    );
    this.tileSelected = new GameObject(
      this.ctx,
      { x: 2135, y: 1720 },
      "assets/inventorySelected.png"
    );
    this.quickAccess = Array(8)
      .fill(null)
      .map(() => new InvSlot(this.ctx));
    this.quickAccess[3].item = new Item(
      ctx,
      "Sapphire Sword",
      ItemTypes.Weapon,
      "assets/ironSword.png"
    );
    this.quickAccess[1].item = new Item(
      ctx,
      "Health Potion",
      ItemTypes.Interactable,
      "assets/healthPotion.png"
    );

    this.quickAccess[0].item = new Item(
      this.ctx,
      "food",
      ItemTypes.Interactable,
      "assets/blessedSword.png"
    );
  }
  draw(player: Player) {
    const selectedSlot = this.quickAccess[this.selected];
    if (selectedSlot.item) {
      if (selectedSlot.item.type === ItemTypes.Weapon) {
        const dx = player.mouse.x - player.pos.x;
        const dy = player.mouse.y - player.pos.y - player.height / 4;
        const angle = Math.atan2(dy, dx) + 0.785398;

        this.ctx.save();
        this.ctx.translate(
          player.pos.x + player.width / 2,
          player.pos.y + player.height / 2
        );
        this.ctx.translate(0, 16); // Move the rotation center to the center of the image
        this.ctx.rotate(angle);
        this.ctx.drawImage(selectedSlot.item.tile.img, -27, -72, 96, 96); // Adjust the position to center the image
        this.ctx.fillStyle = "rgba(255,255,255,0.5)";

        this.ctx.restore();
      } else {
        this.ctx.drawImage(
          selectedSlot.item.tile.img,
          player.pos.x,
          player.pos.y,
          96,
          96
        );
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
      } else {
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
