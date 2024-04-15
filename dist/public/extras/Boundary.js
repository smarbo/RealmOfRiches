export class Boundary {
    ctx;
    pos;
    static width = 48;
    static height = 48;
    width;
    height;
    constructor(ctx, pos) {
        this.ctx = ctx;
        this.pos = pos;
        this.width = 48;
        this.height = 48;
    }
    draw() {
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
}
