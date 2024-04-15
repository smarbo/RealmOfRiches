import { Vector } from "./Vector";

export class Boundary {
  static width = 48;
  static height = 48;
  width: number;
  height: number;
  constructor(public ctx: CanvasRenderingContext2D, public pos: Vector) {
    this.width = 48;
    this.height = 48;
  }

  draw() {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }
}
