import { GameObject } from "./GameObject.js";
export var ItemTypes;
(function (ItemTypes) {
    ItemTypes[ItemTypes["Interactable"] = 0] = "Interactable";
    ItemTypes[ItemTypes["Weapon"] = 1] = "Weapon";
})(ItemTypes || (ItemTypes = {}));
export class Item {
    ctx;
    name;
    type;
    tile;
    constructor(ctx, name, type, imgPath) {
        this.ctx = ctx;
        this.name = name;
        this.type = type;
        this.tile = new GameObject(this.ctx, { x: 0, y: 0 }, imgPath);
    }
}
