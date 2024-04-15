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

  draw() {
    this.ctx.drawImage(this.img, this.pos.x, this.pos.y);
  }
}
