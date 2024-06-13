import { Boundary } from "./Boundary.js";
import { GameObject } from "./GameObject.js";
export class Map {
    spawnPoint;
    id;
    base;
    fore;
    boundaries = [];
    constructor(ctx, baseImg, foregroundImg, collisions, rowLength, spawnPoint, id) {
        this.spawnPoint = spawnPoint;
        this.id = id;
        this.base = new GameObject(ctx, { x: 0, y: 0 }, "");
        let base = new GameObject(ctx, { x: 0, y: 0 }, baseImg);
        base.img.onload = () => {
            this.base = base;
        };
        this.fore = new GameObject(ctx, { x: 0, y: 0 }, foregroundImg);
        const collisionsMap = [];
        for (let i = 0; i < collisions.length; i += rowLength) {
            collisionsMap.push(collisions.slice(i, i + rowLength));
        }
        collisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 28901) {
                    this.boundaries.push(new Boundary(ctx, { x: j * Boundary.width, y: i * Boundary.height }));
                }
            });
        });
    }
    drawBase() {
        this.base.ctx.imageSmoothingEnabled = false;
        this.base.ctx.drawImage(this.base.img, this.base.pos.x, this.base.pos.y, this.base.img.width * 4, this.base.img.height * 4);
    }
    drawFore() {
        this.fore.ctx.imageSmoothingEnabled = false;
        this.fore.ctx.drawImage(this.fore.img, this.fore.pos.x, this.fore.pos.y, this.fore.img.width * 4, this.fore.img.height * 4);
    }
}
