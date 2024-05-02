import { GameObject } from "./GameObject";
import { Vector } from "./Vector";

export class Sword extends GameObject {
  rot: number = 0;

  constructor(ctx: CanvasRenderingContext2D, pos: Vector, img: string) {
    super(ctx, pos, img);
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.pos.x, this.pos.y);
    this.ctx.rotate(this.rot);
    this.ctx.drawImage(this.img, 0, 0);
    this.ctx.restore();
  }
}
