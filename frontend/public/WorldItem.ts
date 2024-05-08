import { GameObject } from "./GameObject.js";
import { ItemTypes } from "./Item.js";
import { Player } from "./Player.js";
import { Vector, magnitude } from "./Vector.js";

export class WorldItem extends GameObject {
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    img: string,
    public name: string,
    public type: ItemTypes
  ) {
    super(ctx, pos, img);
  }

  collect(player: Player): boolean {
    let grabbed: boolean;
    let md = magnitude({
      x: player.mouse.x - this.pos.x + this.img.width / 2,
      y: player.mouse.y - this.pos.y + this.img.width / 2,
    });
    let pd = magnitude({
      x: player.pos.x + player.width / 2 - this.pos.x,
      y: player.pos.y + player.width / 2 - this.pos.y,
    });
    if (
      pd <= 100 &&
      md <= 20 /* If the object is within radius of the player and the mouse */
    ) {
      grabbed = true;
      player.inventory.add(this.name, this.type, this.img.src);
      player.grabbing = false;
    } else grabbed = false;
    return grabbed;
  }
}
