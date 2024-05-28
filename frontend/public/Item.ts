import { GameObject } from "./GameObject.js";
import { Player } from "./Player.js";
import { Sword } from "./Sword.js";

export enum ItemTypes {
  Interactable,
  Sword,
}

export const Items: {
  [id: string]: {
    img: string;
    type: ItemTypes;
    name: string;
    image: HTMLImageElement;
    use: Function;
  };
} = {};

export class Item {
  obj: GameObject | Sword;
  name: string;
  type: ItemTypes;
  img: string;
  use: Function;
  constructor(public ctx: CanvasRenderingContext2D, public id: string) {
    this.name = Items[id].name;
    this.type = Items[id].type;
    this.img = Items[id].img;
    this.use = Items[id].use;
    if (this.type === ItemTypes.Sword) {
      this.obj = new Sword(this.ctx, { x: 0, y: 0 }, this.img, 25);
    } else {
      this.obj = new GameObject(this.ctx, { x: 0, y: 0 }, this.img);
    }
  }
}

function createItem(
  id: string,
  name: string,
  type: ItemTypes,
  img: string,
  use: Function
) {
  Items[id] = {
    img: img,
    type: type,
    name: name,
    image: new Image(),
    use: use,
  };
  Items[id].image.src = img;
}

createItem(
  "ironSword",
  "Iron Sword",
  ItemTypes.Sword,
  "/assets/ironSword.png",
  () => {}
);
createItem(
  "ironAxe",
  "Iron Axe",
  ItemTypes.Sword,
  "/assets/ironAxe.png",
  () => {}
);
createItem(
  "healthPotion",
  "Health Potion",
  ItemTypes.Interactable,
  "/assets/healthPotion.png",
  (player: Player) => {
    player.health += 50;
  }
);
createItem(
  "cookie",
  "Jamie's Cookie",
  ItemTypes.Interactable,
  "/assets/cookie.png",
  (player: Player) => {
    player.energy += 15;
  }
);
createItem(
  "blessedSword",
  "Blessed Sword",
  ItemTypes.Sword,
  "/assets/blessedSword.png",
  () => {}
);
createItem(
  "rustySword",
  "Rusty Sword",
  ItemTypes.Sword,
  "/assets/rustySword.png",
  () => {}
);
