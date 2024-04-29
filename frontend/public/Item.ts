import { GameObject } from "./GameObject.js";

export enum ItemTypes {
  Interactable,
  Weapon,
}

export class Item {
  tile: GameObject;
  constructor(
    public ctx: CanvasRenderingContext2D,
    public name: string,
    public type: ItemTypes,
    imgPath: string
  ) {
    this.tile = new GameObject(this.ctx, { x: 0, y: 0 }, imgPath);
  }
}
