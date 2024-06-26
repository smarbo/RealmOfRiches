import { GameObject } from "./GameObject.js";
import { Item, ItemTypes, Items } from "./Item.js";
import { OtherPlayer } from "./OtherPlayer.js";
import { Player } from "./Player.js";
import { Sword } from "./Sword.js";
import { Vector, magnitude, rotateVector } from "./Vector.js";
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
  ids: string[] = [];
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

    this.ctx.canvas.addEventListener("click", () => {
      const plr = player as Player;
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
          break;
        }
      }
    });
    this.ctx.canvas.addEventListener("touchstart", () => {
      const plr = player as Player;
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
          break;
        }
      }
    });
    this.tileRegular = new GameObject(
      this.ctx,
      { x: 2135, y: 1720 },
      "/assets/inventoryTile.png"
    );
    this.tileSelected = new GameObject(
      this.ctx,
      { x: 2135, y: 1720 },
      "/assets/inventorySelected.png"
    );
    this.quickAccess = Array(8)
      .fill(null)
      .map(() => new InvSlot(this.ctx));
  }

  async update() {
    this.ids = this.quickAccess.map((s) => (s.item ? s.item.id : ""));
    await fetch(`/api/user/${localStorage.getItem("username")}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        inventory: this.ids,
      }),
    });
  }

  async add(id: string) {
    for (let i = 0; i < this.quickAccess.length; i++) {
      let slot = this.quickAccess[i];
      if (!slot.item) {
        slot.item = new Item(this.ctx, id);
        break;
      }
    }
    await this.update();
  }

  async use(player: Player) {
    const slot = this.quickAccess[this.selected];
    if (slot.item && slot.item.type === ItemTypes.Interactable)
      slot.item.use(player);
    delete slot.item;
    await this.update();
  }

  draw(player: Player) {
    this.ctx.imageSmoothingEnabled = false;
    const selectedSlot = this.quickAccess[this.selected];
    if (selectedSlot.item) {
      if (selectedSlot.item.obj instanceof Sword) {
        let pos: Vector = { x: 0, y: 0 };
        let dv: Vector = {
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
          } else {
            pos.x = player.mouse.x + player.width / 2;
            pos.y = player.mouse.y + player.height / 2;
          }
        } else {
          pos = {
            x:
              player.pos.x +
              player.width / 2 +
              Math.cos(player.mouseAngle) * selectedSlot.item.obj.reach,
            y:
              player.pos.y +
              player.height / 2 +
              Math.sin(player.mouseAngle) * selectedSlot.item.obj.reach,
          };
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

        if (player.inputs.use) {
          this.use(player);
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
