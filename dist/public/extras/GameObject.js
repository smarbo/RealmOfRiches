export class GameObject {
    ctx;
    pos;
    img;
    rot = 0;
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
    collides(obj, cw, ch, ow, oh) {
        let deg = (this.rot * 180) / Math.PI - 35;
        if (deg > 0 && deg < 45) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch / 2) {
                return true;
            }
        }
        if (deg > 45 && deg < 60) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch) {
                return true;
            }
        }
        if (deg > 60 && deg < 90) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw / 2 &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch) {
                return true;
            }
        }
        if (deg > 90 && deg < 120) {
            if (obj.pos.x + ow > this.pos.x - cw / 2 &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch) {
                return true;
            }
        }
        if (deg > 120 && deg < 150) {
            if (obj.pos.x + ow > this.pos.x - cw &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch) {
                return true;
            }
        }
        if (deg > 150 && deg < 200) {
            if (obj.pos.x + ow > this.pos.x - cw &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y &&
                obj.pos.y < this.pos.y + ch / 2) {
                return true;
            }
        }
        if (deg > -180 && deg < -150) {
            if (obj.pos.x + ow > this.pos.x - cw &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y - ch / 2 &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        if (deg > -150 && deg < -120) {
            if (obj.pos.x + ow > this.pos.x - cw &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y - cw &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        if (deg > -120 && deg < -90) {
            if (obj.pos.x + ow > this.pos.x - cw / 2 &&
                obj.pos.x < this.pos.x &&
                obj.pos.y + oh > this.pos.y - cw &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        if (deg > -90 && deg < -60) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw / 2 &&
                obj.pos.y + oh > this.pos.y - cw &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        if (deg > -60 && deg < -30) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw &&
                obj.pos.y + oh > this.pos.y - cw &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        if (deg > -30 && deg < 0) {
            if (obj.pos.x + ow > this.pos.x &&
                obj.pos.x < this.pos.x + cw &&
                obj.pos.y + oh > this.pos.y - ch / 2 &&
                obj.pos.y < this.pos.y) {
                return true;
            }
        }
        return false;
    }
}
