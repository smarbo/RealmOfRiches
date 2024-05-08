import { GameObject } from "./GameObject.js";
import { Sword } from "./Sword.js";
export var ItemTypes;
(function (ItemTypes) {
    ItemTypes[ItemTypes["Interactable"] = 0] = "Interactable";
    ItemTypes[ItemTypes["Sword"] = 1] = "Sword";
})(ItemTypes || (ItemTypes = {}));
export class Item {
    ctx;
    name;
    type;
    obj;
    constructor(ctx, name, type, imgPath) {
        this.ctx = ctx;
        this.name = name;
        this.type = type;
        if (this.type === ItemTypes.Sword) {
            this.obj = new Sword(this.ctx, { x: 0, y: 0 }, imgPath, 25);
        }
        else {
            this.obj = new GameObject(this.ctx, { x: 0, y: 0 }, imgPath);
        }
    }
}
