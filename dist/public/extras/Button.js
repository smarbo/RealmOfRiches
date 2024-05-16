import { GameObject } from "./GameObject.js";
export var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["Settings"] = 0] = "Settings";
    ButtonType[ButtonType["Menu"] = 1] = "Menu";
    ButtonType[ButtonType["Death"] = 2] = "Death";
})(ButtonType || (ButtonType = {}));
export class Button extends GameObject {
    text;
    fun;
    static width = 192;
    static height = 48;
    width = 0;
    height = 0;
    hoverImg;
    constructor(ctx, pos, text, scale, fun) {
        super(ctx, pos, "assets/button.png");
        this.text = text;
        this.fun = fun;
        this.hoverImg = new Image();
        this.hoverImg.src = "assets/buttonHover.png";
        this.img.onload = () => {
            this.width = this.img.width * scale;
            this.height = this.img.height * scale;
        };
    }
    draw() {
        this.ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
        this.ctx.font = "24px VT323";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.text, this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    }
    drawHover() {
        this.ctx.drawImage(this.hoverImg, this.pos.x, this.pos.y, this.width, this.height);
        this.ctx.font = "24px VT323";
        this.ctx.fillStyle = "#bac7d1";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.text, this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    }
    hover(mouse) {
        return (mouse.x >= this.pos.x - 24 &&
            mouse.x <= this.pos.x + this.width - 24 &&
            mouse.y >= this.pos.y - this.height / 2 &&
            mouse.y <= this.pos.y + this.height / 2);
    }
}
