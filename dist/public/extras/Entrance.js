export class Entrance {
    ctx;
    pos;
    static width = 48;
    static height = 48;
    height = 48;
    width = 48;
    constructor(ctx, pos) {
        this.ctx = ctx;
        this.pos = pos;
    }
    draw() {
        this.ctx.fillStyle = "purple";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
}
