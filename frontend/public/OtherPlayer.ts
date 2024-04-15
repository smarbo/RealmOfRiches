import { GameObject } from "./GameObject.js";
import { Vector } from "./Vector.js";

type Frames = {
  max: number;
  val: number;
  tick: number;
  imgs: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
};

export class OtherPlayer extends GameObject {
  lastKey: string;
  width: number;
  height: number;
  moving: boolean = false;
  static width = 48;
  static height = 68;
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    img: string,
    public frames: Frames = {
      max: 4,
      val: 0,
      tick: 0,
      imgs: {
        up: new Image(),
        left: new Image(),
        right: new Image(),
        down: new Image(),
      },
    }
  ) {
    super(ctx, pos, img);
    this.lastKey = "";
    this.frames.imgs.up.src = "assets/playerUp.png";
    this.frames.imgs.down.src = "assets/playerDown.png";
    this.frames.imgs.left.src = "assets/playerLeft.png";
    this.frames.imgs.right.src = "assets/playerRight.png";
    this.width = OtherPlayer.width;
    this.height = OtherPlayer.height;
  }

  animate() {
    if (this.lastKey === "w") {
      this.img = this.frames.imgs.up;
    }
    if (this.lastKey === "s") {
      this.img = this.frames.imgs.down;
    }
    if (this.lastKey === "a") {
      this.img = this.frames.imgs.left;
    }
    if (this.lastKey === "d") {
      this.img = this.frames.imgs.right;
    }
  }
  draw() {
    this.ctx.drawImage(
      this.img,
      this.width * this.frames.val,
      0,
      this.img.width / this.frames.max,
      this.img.height,
      this.pos.x,
      this.pos.y,
      this.img.width / this.frames.max,
      this.img.height
    );
  }
}
