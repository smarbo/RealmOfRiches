import { GameObject } from "./GameObject.js";
export class Button extends GameObject {
    width = 0;
    height = 0;
    hoverImg;
    constructor(ctx, pos, img, hoverImg, scale) {
        super(ctx, pos, img);
        this.hoverImg = new Image();
        this.hoverImg.src = hoverImg;
        this.img.onload = () => {
            this.width = this.img.width * scale;
            this.height = this.img.height * scale;
        };
    }
    draw() {
        this.ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
    }
    drawHover() {
        this.ctx.drawImage(this.hoverImg, this.pos.x, this.pos.y, this.width, this.height);
    }
    hover(mouse) {
        return (mouse.x >= this.pos.x - 24 &&
            mouse.x <= this.pos.x + this.width - 24 &&
            mouse.y >= this.pos.y - this.height / 2 &&
            mouse.y <= this.pos.y + this.height / 2);
    }
}
