import { GameObject } from "./GameObject.js";
import { Item, ItemTypes, Items } from "./Item.js";
import { OtherPlayer } from "./OtherPlayer.js";
import { Player } from "./Player.js";
import { Sword } from "./Sword.js";
import { Vector, magnitude } from "./Vector.js";

export class InvSlot {
  constructor(public ctx: CanvasRenderingContext2D, public item?: Item) {}
  draw(tile: GameObject) {
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
  selected = 0;
  quickAccess: InvSlot[];
  storage: InvSlot[][] = [[]];
  tileRegular: GameObject;
  tileSelected: GameObject;
  mouseAngle: number = 0;
  constructor(
    public ctx: CanvasRenderingContext2D,
    player: Player | OtherPlayer
  ) {
    this.ctx.canvas.addEventListener("mousedown", () => {
      if (
        this.quickAccess[this.selected].item?.obj instanceof Sword &&
        player.energy >= 1
      ) {
        const sword = this.quickAccess[this.selected].item?.obj as Sword;
        sword.attacking = true;
      }
    });
    this.ctx.canvas.addEventListener("mouseup", () => {
      if (this.quickAccess[this.selected].item?.obj instanceof Sword) {
        const sword = this.quickAccess[this.selected].item?.obj as Sword;
        sword.attacking = false;
      }
    });
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

    this.add("healthPotion");
    this.add("blessedSword");
    this.add("ironAxe");
    this.add("cookie");
  }

  add(id: string) {
    for (let i = 0; i < this.quickAccess.length; i++) {
      let slot = this.quickAccess[i];
      if (!slot.item) {
        slot.item = new Item(this.ctx, id);
        break;
      }
    }
  }

  draw(player: Player) {
    const selectedSlot = this.quickAccess[this.selected];
    if (selectedSlot.item) {
      if (selectedSlot.item.obj instanceof Sword) {
        let pos: Vector = { x: 0, y: 0 };
        let dv: Vector = {
          x: player.mouse.x - player.pos.x,
          y: player.mouse.y - player.pos.y,
        };
        let d = magnitude(dv);
        if (d > selectedSlot.item.obj.reach) {
          dv.x = (dv.x / d) * selectedSlot.item.obj.reach;
          dv.y = (dv.y / d) * selectedSlot.item.obj.reach;
          pos.x = player.pos.x + dv.x + player.width / 2;
          pos.y = player.pos.y + dv.y + player.height / 2;
        } else {
          pos.x = player.mouse.x + player.width / 2;
          pos.y = player.mouse.y + player.height / 2;
        }

        selectedSlot.item.obj.update(
          pos,
          player.mouseAngle + (45 * Math.PI) / 180
        );
        if (selectedSlot.item.obj.attacking) {
          if (player.energy < 1) selectedSlot.item.obj.attacking = false;
          player.energy -= 0.2;
        }
        selectedSlot.item.obj.animate();
        selectedSlot.item.obj.draw();
      } else {
        this.ctx.drawImage(
          selectedSlot.item.obj.img,
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

/*

Make selected item be drawn under foreground objects - 
separate function within inventory class to draw selected item, call this before foreground objects in world.ts

*/
