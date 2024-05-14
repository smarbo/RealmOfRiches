import { GameObject } from "./GameObject.js";
import { magnitude } from "./Vector.js";
export var Direction;
(function (Direction) {
    Direction[Direction["Left"] = 0] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Up"] = 2] = "Up";
    Direction[Direction["Down"] = 3] = "Down";
    Direction[Direction["None"] = 4] = "None";
})(Direction || (Direction = {}));
function unique(pre) {
    const randomNumber = Math.floor(Math.random() * 45000); // You can adjust the range as needed
    return `${pre}_` + randomNumber.toString();
}
export class Skeleton extends GameObject {
    speed;
    id;
    frames;
    aframes;
    static width = 48;
    static height = 68;
    width;
    height;
    moving = false;
    colliding = true;
    direction = Direction.None;
    crumbRadius = 15;
    attackRadius = 100;
    crumbs = { tick: 0, list: [] };
    health = 100;
    attacking = false;
    damage = 8;
    constructor(ctx, pos, img, speed, id = unique("skeleton"), frames = {
        max: 4,
        val: 0,
        tick: 0,
        imgs: {
            up: new Image(),
            left: new Image(),
            right: new Image(),
            down: new Image(),
        },
    }, aframes = {
        max: 10,
        val: 0,
        tick: 0,
        sheet: new Image(),
    }) {
        super(ctx, pos, img);
        this.speed = speed;
        this.id = id;
        this.frames = frames;
        this.aframes = aframes;
        this.frames.imgs.up.src = "assets/skeleUp.png";
        this.frames.imgs.left.src = "assets/skeleLeft.png";
        this.frames.imgs.down.src = "assets/skeleDown.png";
        this.frames.imgs.right.src = "assets/skeleRight.png";
        this.aframes.sheet.src = "assets/skeleAttack.png";
        this.width = Skeleton.width;
        this.height = Skeleton.height;
    }
    update() {
        if (this.health > 100) {
            this.health = 100;
        }
        this.img = this.frames.imgs.down;
        switch (this.direction) {
            case Direction.Left:
                this.pos.x -= this.speed;
                break;
            case Direction.Right:
                this.pos.x += this.speed;
                break;
            case Direction.Up:
                this.pos.y -= this.speed;
                break;
            case Direction.Down:
                this.pos.y += this.speed;
                break;
            case Direction.None:
                break;
        }
    }
    ai(plr) {
        this.frames.tick += 1;
        this.crumbs.tick += 1;
        if (this.attacking) {
            this.aframes.tick += 1;
            if (this.aframes.tick === 3) {
                this.aframes.tick = 0;
                if (this.aframes.val < this.aframes.max - 1)
                    this.aframes.val += 1;
                else {
                    this.aframes.val = 0;
                    plr.health -= this.damage;
                    this.attacking = false;
                }
            }
        }
        if (this.crumbs.tick === 15) {
            this.crumbs.list.push({
                x: plr.pos.x + plr.width / 2,
                y: plr.pos.y + plr.height / 2,
            });
            this.crumbs.tick = 0;
            if (this.crumbs.list.length > 10) {
                this.crumbs.list.shift();
            }
        }
        if (this.frames.tick === 10) {
            this.frames.tick = 0;
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val += 1;
            }
            else
                this.frames.val = 0;
        }
        /*
        // for debugging
        this.crumbs.list.forEach((c) => {
          this.ctx.fillStyle = "red";
          this.ctx.fillRect(c.x, c.y, 20, 20);
        });*/
        const pd = {
            x: plr.pos.x + plr.width / 2 - (this.pos.x + this.width / 2),
            y: plr.pos.y + plr.height / 2 - (this.pos.y + this.height / 2),
        };
        /*
        // for debugging
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(
          plr.pos.x + plr.width / 2,
          plr.pos.y + plr.height / 2,
          20,
          20
        );
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(
          this.pos.x + this.width / 2,
          this.pos.y + this.height / 2,
          20,
          20
        );
      */
        if (this.crumbs.list[0] && magnitude(pd) > this.attackRadius) {
            const crumb = this.crumbs.list[0];
            const cd = {
                x: crumb.x - this.pos.x,
                y: crumb.y - this.pos.y,
            };
            if (cd.x > this.crumbRadius) {
                this.direction = Direction.Right;
            }
            else if (cd.x < -this.crumbRadius) {
                this.direction = Direction.Left;
            }
            else if (cd.y > this.crumbRadius) {
                this.direction = Direction.Down;
            }
            else if (cd.y < -this.crumbRadius) {
                this.direction = Direction.Up;
            }
            else {
                this.direction = Direction.None;
            }
        }
        else {
            this.direction = Direction.None;
            this.attacking = true;
        }
    }
    draw() {
        if (!this.attacking) {
            switch (this.direction) {
                case Direction.Left:
                    this.img = this.frames.imgs.left;
                    break;
                case Direction.Right:
                    this.img = this.frames.imgs.right;
                    break;
                case Direction.Up:
                    this.img = this.frames.imgs.up;
                    break;
                case Direction.Down:
                    this.img = this.frames.imgs.down;
                    break;
                case Direction.None:
                    break;
            }
            this.ctx.drawImage(this.img, (this.img.width / this.frames.max) * this.frames.val, 0, this.img.width / this.frames.max, this.img.height, this.pos.x, this.pos.y, (this.img.width / this.frames.max) * 4, this.img.height * 4);
        }
        else {
            this.img = this.aframes.sheet;
            this.ctx.drawImage(this.img, (this.img.width / this.aframes.max) * this.aframes.val, 0, this.img.width / this.aframes.max, this.img.height, this.pos.x, this.pos.y, (this.img.width / this.aframes.max) * 4, this.img.height * 4);
        }
        this.ctx.fillStyle = "rgba(0,0,0,0.3)";
        this.ctx.fillRect(this.pos.x + this.width / 6, this.pos.y - 8, this.width, 10);
        this.ctx.fillStyle = "rgba(200,0,0,0.7)";
        this.ctx.fillRect(this.pos.x + this.width / 6, this.pos.y - 8, (this.width * this.health) / 100, 10);
    }
}
