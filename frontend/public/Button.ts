import { GameObject } from "./GameObject.js";
import { Vector } from "./Vector.js";

export class Button extends GameObject {
  width: number = 0;
  height: number = 0;
  hoverImg: HTMLImageElement;
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    img: string,
    hoverImg: string,
    scale: number
  ) {
    super(ctx, pos, img);
    this.hoverImg = new Image();
    this.hoverImg.src = hoverImg;
    this.img.onload = () => {
      this.width = this.img.width * scale;
      this.height = this.img.height * scale;
    };
  }

  draw() {
    this.ctx.drawImage(
      this.img,
      this.pos.x,
      this.pos.y,
      this.width,
      this.height
    );
  }

  drawHover() {
    this.ctx.drawImage(
      this.hoverImg,
      this.pos.x,
      this.pos.y,
      this.width,
      this.height
    );
  }

  hover(mouse: Vector): boolean {
    return (
      mouse.x >= this.pos.x - 24 &&
      mouse.x <= this.pos.x + this.width - 24 &&
      mouse.y >= this.pos.y - this.height / 2 &&
      mouse.y <= this.pos.y + this.height / 2
    );
  }
}
