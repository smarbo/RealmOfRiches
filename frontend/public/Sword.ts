import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { Vector } from "./Vector.js";

type Frames = {
  max: number;
  val: number;
  tick: number;
  sheet: HTMLImageElement;
};

export class Sword extends GameObject {
  rot: number = 0;
  hitting: boolean = false;
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    img: string,
    public reach: number,
    public frames: Frames = {
      max: 8,
      val: 0,
      tick: 0,
      sheet: new Image(),
    },
    public attacking: boolean = false
  ) {
    super(ctx, pos, img);
    this.frames.sheet.src = "assets/attackAnimation.png";
  }

  update(pos: Vector, rot: number) {
    this.pos = pos;
    this.rot = rot;
  }

  animate() {
    if (this.attacking) {
      this.frames.tick += 1;
      if (this.frames.tick === 2) {
        this.frames.val += 1;
        this.frames.tick = 0;
      }
      if (this.frames.val === this.frames.max) this.frames.val = 0;
    } else {
      this.frames.val = 0;
      this.frames.tick = 0;
    }
  }

  draw(width?: number, height?: number) {
    if (width && height) {
      this.ctx.drawImage(this.img, this.pos.x, this.pos.y, width, height);
    } else {
      this.ctx.save();
      this.ctx.translate(this.pos.x, this.pos.y);
      this.ctx.rotate(this.rot);
      this.ctx.drawImage(this.img, -27, -72, 96, 96);
      if (this.attacking) {
        this.ctx.drawImage(
          this.frames.sheet,
          this.frames.val * 32,
          0,
          32,
          32,
          -27,
          -72,
          96,
          96
        );
      }

      this.ctx.restore();
    }
  }
}
