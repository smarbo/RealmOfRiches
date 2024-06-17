import { Vector } from "./Vector.js";

export class Entrance {
  static width = 48;
  static height = 48;
  height = 48;
  width = 48;

  constructor(public ctx: CanvasRenderingContext2D, public pos: Vector) {}

  draw() {
    this.ctx.fillStyle = "purple";
    this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }
}
