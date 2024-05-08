import { GameObject } from "./GameObject.js";
export class Sword extends GameObject {
    reach;
    frames;
    attacking;
    rot = 0;
    constructor(ctx, pos, img, reach, frames = {
        max: 8,
        val: 0,
        tick: 0,
        sheet: new Image(),
    }, attacking = false) {
        super(ctx, pos, img);
        this.reach = reach;
        this.frames = frames;
        this.attacking = attacking;
        this.frames.sheet.src = "assets/attackAnimation.png";
    }
    update(pos, rot) {
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
            if (this.frames.val === this.frames.max)
                this.frames.val = 0;
        }
        else {
            this.frames.val = 0;
            this.frames.tick = 0;
        }
    }
    draw(width, height) {
        if (width && height) {
            this.ctx.drawImage(this.img, this.pos.x, this.pos.y, width, height);
        }
        else {
            this.ctx.save();
            this.ctx.translate(this.pos.x, this.pos.y);
            this.ctx.rotate(this.rot);
            this.ctx.drawImage(this.img, -27, -72, 96, 96);
            if (this.attacking) {
                this.ctx.drawImage(this.frames.sheet, this.frames.val * 32, 0, 32, 32, -27, -72, 96, 96);
            }
            this.ctx.restore();
        }
    }
}
