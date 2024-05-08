import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { Sword } from "./Sword.js";

export enum ItemTypes {
  Interactable,
  Sword,
}

export class Item {
  obj: GameObject | Sword;
  constructor(
    public ctx: CanvasRenderingContext2D,
    public name: string,
    public type: ItemTypes,
    imgPath: string
  ) {
    if (this.type === ItemTypes.Sword) {
      this.obj = new Sword(this.ctx, { x: 0, y: 0 }, imgPath, 25);
    } else {
      this.obj = new GameObject(this.ctx, { x: 0, y: 0 }, imgPath);
    }
  }
}
