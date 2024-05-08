import { Player } from "./Player.js";
import { Vector } from "./Vector.js";
export class GameObject {
  img: HTMLImageElement;
  constructor(
    public ctx: CanvasRenderingContext2D,
    public pos: Vector,
    img: string
  ) {
    this.img = new Image();
    this.img.src = img;
  }

  draw(width?: number, height?: number) {
    if (width && height) {
      this.ctx.drawImage(this.img, this.pos.x, this.pos.y, width, height);
    } else {
      this.ctx.drawImage(this.img, this.pos.x, this.pos.y);
    }
  }
}
