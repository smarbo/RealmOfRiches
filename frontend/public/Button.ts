import { GameObject } from "./GameObject.js";
import { Vector } from "./Vector.js";

export enum ButtonType {
  Settings,
  Menu,
  Death,
}

export class Button extends GameObject {
  static width: number = 192;
  static height: number = 48;
  width: number = 0;
  height: number = 0;
  hoverImg: HTMLImageElement;
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    public text: string,
    scale: number,
    public fun: Function,
    public overlay?: string
  ) {
    super(ctx, pos, "/assets/button.png");
    this.hoverImg = new Image();
    this.hoverImg.src = "/assets/buttonHover.png";
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
    this.overlay && this.drawOverlay();
    this.ctx.font = "24px VT323";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.text,
      this.pos.x + this.width / 2,
      this.pos.y + this.height / 2
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
    this.overlay && this.drawOverlay();
    this.ctx.font = "24px VT323";
    this.ctx.fillStyle = "#bac7d1";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.text,
      this.pos.x + this.width / 2,
      this.pos.y + this.height / 2
    );
  }

  private drawOverlay() {
    this.ctx.fillStyle = this.overlay!;
    this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
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
