export class GameObject {
    ctx;
    pos;
    img;
    constructor(ctx, pos, img) {
        this.ctx = ctx;
        this.pos = pos;
        this.img = new Image();
        this.img.src = img;
    }
    draw(width, height) {
        if (width && height) {
            this.ctx.drawImage(this.img, this.pos.x, this.pos.y, width, height);
        }
        else {
            this.ctx.drawImage(this.img, this.pos.x, this.pos.y);
        }
    }
}
