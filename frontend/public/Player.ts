import { GameObject } from "./GameObject.js";
import { Inputs } from "./Inputs.js";
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

export class Player extends GameObject {
  inputs: Inputs;
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
    public speed: number,
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
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.lastKey = "";
    this.frames.imgs.up.src = "assets/playerUp.png";
    this.frames.imgs.down.src = "assets/playerDown.png";
    this.frames.imgs.left.src = "assets/playerLeft.png";
    this.frames.imgs.right.src = "assets/playerRight.png";
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      switch (e.key) {
        case "w":
          this.inputs.up = true;
          this.lastKey = "w";
          this.moving = true;
          break;
        case "s":
          this.inputs.down = true;
          this.lastKey = "s";
          this.moving = true;
          break;
        case "a":
          this.inputs.left = true;
          this.lastKey = "a";
          this.moving = true;
          break;
        case "d":
          this.inputs.right = true;
          this.lastKey = "d";
          this.moving = true;
          break;
      }
    });
    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
          this.inputs.up = false;
          this.moving = false;
          break;

        case "s":
          this.inputs.down = false;
          this.moving = false;
          break;

        case "a":
          this.inputs.left = false;
          this.moving = false;
          break;
        case "d":
          this.inputs.right = false;
          this.moving = false;
          break;
      }
    });
    this.width = Player.width;
    this.height = Player.height;
  }
  update() {
    if (this.inputs.up && this.lastKey === "w") {
      this.pos.y -= this.speed;
      this.img = this.frames.imgs.up;
    }
    if (this.inputs.down && this.lastKey === "s") {
      this.pos.y += this.speed;
      this.img = this.frames.imgs.down;
    }
    if (this.inputs.left && this.lastKey === "a") {
      this.pos.x -= this.speed;
      this.img = this.frames.imgs.left;
    }
    if (this.inputs.right && this.lastKey === "d") {
      this.pos.x += this.speed;
      this.img = this.frames.imgs.right;
    }
  }

  animate() {
    if (this.moving) {
      this.frames.tick += 1;
      if (this.frames.tick === 20) {
        this.frames.val += 1;
        this.frames.tick = 0;
      }

      if (this.frames.val === this.frames.max) this.frames.val = 0;
    } else {
      this.frames.tick = 9;
      this.frames.val = 0;
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
