import { GameObject } from "./GameObject";
export class Sword extends GameObject {
    rot = 0;
    constructor(ctx, pos, img) {
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
