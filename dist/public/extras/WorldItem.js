import { GameObject } from "./GameObject.js";
import { magnitude } from "./Vector.js";
export class WorldItem extends GameObject {
    name;
    type;
    constructor(ctx, pos, img, name, type) {
        super(ctx, pos, img);
        this.name = name;
        this.type = type;
    }
    collect(player) {
        if (player.grabbing) {
            let grabbed;
            let md = magnitude({
                x: player.mouse.x - this.pos.x + this.img.width / 2,
                y: player.mouse.y - this.pos.y + this.img.width / 2,
            });
            let pd = magnitude({
                x: player.pos.x + player.width / 2 - this.pos.x,
                y: player.pos.y + player.width / 2 - this.pos.y,
            });
            if (pd <= 130 &&
                md <=
                    64 /* If the object is within radius of the player and the mouse */) {
                grabbed = true;
                player.inventory.add(this.name, this.type, this.img.src);
                player.grabbing = false;
            }
            else
                grabbed = false;
            return grabbed;
        }
        else {
            return false;
        }
    }
}
