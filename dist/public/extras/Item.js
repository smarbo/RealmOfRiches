import { GameObject } from "./GameObject.js";
import { Sword } from "./Sword.js";
export var ItemTypes;
(function (ItemTypes) {
    ItemTypes[ItemTypes["Interactable"] = 0] = "Interactable";
    ItemTypes[ItemTypes["Sword"] = 1] = "Sword";
})(ItemTypes || (ItemTypes = {}));
export const Items = {};
export class Item {
    ctx;
    id;
    obj;
    name;
    type;
    img;
    constructor(ctx, id) {
        this.ctx = ctx;
        this.id = id;
        this.name = Items[id].name;
        this.type = Items[id].type;
        this.img = Items[id].img;
        if (this.type === ItemTypes.Sword) {
            this.obj = new Sword(this.ctx, { x: 0, y: 0 }, this.img, 25);
        }
        else {
            this.obj = new GameObject(this.ctx, { x: 0, y: 0 }, this.img);
        }
    }
}
function createItem(id, name, type, img) {
    Items[id] = { img: img, type: type, name: name, image: new Image() };
    Items[id].image.src = img;
}
createItem("ironSword", "Iron Sword", ItemTypes.Sword, "assets/ironSword.png");
createItem("ironAxe", "Iron Axe", ItemTypes.Sword, "assets/ironAxe.png");
createItem("healthPotion", "Health Potion", ItemTypes.Interactable, "assets/healthPotion.png");
createItem("cookie", "Jamie's Cookie", ItemTypes.Interactable, "assets/cookie.png");
createItem("blessedSword", "Blessed Sword", ItemTypes.Sword, "assets/blessedSword.png");
createItem("rustySword", "Rusty Sword", ItemTypes.Sword, "assets/rustySword.png");
