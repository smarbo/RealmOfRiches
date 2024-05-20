import { GameObject } from "./GameObject.js";
import { Inputs } from "./Inputs.js";
import { Vector, magnitude } from "./Vector.js";
import { Inventory } from "./Inventory.js";
import { State } from "./State.js";

const cursor = new Image();
cursor.src = "assets/cursor.png";

export type EntityFrames = {
  max: number;
  val: number;
  tick: number;
  imgs: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
};

export type Hat = {
  front: GameObject;
  side: GameObject;
  back: GameObject;
};

export class Player extends GameObject {
  mobile: boolean = false;
  joystickPos: Vector;
  joystickTouch: number | undefined;
  joyBase: GameObject;
  joyHand: GameObject;
  touches: TouchList | [] = [];
  inputs: Inputs;
  lastKey: string;
  width: number;
  height: number;
  moving: boolean = false;
  static width = 48;
  static height = 68;
  mouse: Vector = { x: 0, y: 0 };
  mouseOffset: Vector = { x: 0, y: 0 };
  mouseAngle: number = 0;
  health = 100;
  energy = 100;
  weaponPosition: Vector = { x: 0, y: 0 };
  id = "";
  inventory: Inventory;
  grabbing: boolean = false;
  hat: Hat;
  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector,
    img: string,
    public spawnEnemy: Function,
    public speed: number,
    public frames: EntityFrames = {
      max: 4,
      val: 0,
      tick: 0,
      imgs: {
        up: new Image(),
        left: new Image(),
        right: new Image(),
        down: new Image(),
      },
    },
    public username: string
  ) {
    super(ctx, pos, img);
    this.inventory = new Inventory(ctx, this);
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false,
      interact: false,
      pause: false,
      mouse: false,
      use: false,
    };
    this.joyBase = new GameObject(
      ctx,
      { x: 25, y: 25 },
      "assets/joystickBase.png"
    );
    this.joyHand = new GameObject(
      ctx,
      { x: 25, y: 25 },
      "assets/joystickHandle.png"
    );
    this.joystickPos = {
      x:
        this.joyBase.pos.x +
        this.joyBase.img.width / 4 -
        this.joyHand.img.width / 4,
      y:
        this.joyBase.pos.y +
        this.joyBase.img.height / 4 -
        this.joyHand.img.height / 4,
    };

    this.lastKey = "";
    this.frames.imgs.up.src = "assets/playerUp.png";
    this.frames.imgs.down.src = "assets/playerDown.png";
    this.frames.imgs.left.src = "assets/playerLeft.png";
    this.frames.imgs.right.src = "assets/playerRight.png";
    window.addEventListener("keydown", (e) => {
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 8) {
        this.inventory.selected = keyNum - 1;
      }
      switch (e.key.toLowerCase()) {
        case "e":
          this.inputs.interact = true;
          break;
        case "w":
          this.inputs.up = true;
          this.lastKey = "w";
          this.moving = true;
          break;
        case "s":
          this.inputs.down = true;
          this.lastKey = "s";
          this.moving = true;
          break;
        case "a":
          this.inputs.left = true;
          this.lastKey = "a";
          this.moving = true;
          break;
        case "d":
          this.inputs.right = true;
          this.lastKey = "d";
          this.moving = true;
          break;
        case "escape":
          this.inputs.pause = true;
          break;
        case "f":
          this.inputs.use = true;
          break;
      }
    });
    window.addEventListener("keyup", (e) => {
      switch (e.key.toLowerCase()) {
        case "e":
          this.inputs.interact = false;
          break;
        case "w":
          this.inputs.up = false;
          this.moving = false;
          break;
        case "s":
          this.inputs.down = false;
          this.moving = false;
          break;
        case "a":
          this.inputs.left = false;
          this.moving = false;
          break;
        case "d":
          this.inputs.right = false;
          this.moving = false;
          break;
        case "escape":
          this.inputs.pause = false;
          break;
        case "f":
          this.inputs.use = false;
          break;
      }
    });
    window.addEventListener("wheel", (e: WheelEvent) => {
      if (e.deltaY > 0) {
        this.inventory.selected -= 1;
        if (this.inventory.selected < 0) this.inventory.selected = 7;
      } else if (e.deltaY < 0) {
        this.inventory.selected += 1;
        if (this.inventory.selected > 7) this.inventory.selected = 0;
      }
    });
    window.addEventListener("mousedown", () => {
      this.inputs.mouse = true;
    });
    window.addEventListener("mouseup", () => {
      this.inputs.mouse = false;
    });
    this.ctx.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      // Mouse offset
      const rect = this.ctx.canvas.getBoundingClientRect();
      this.mouseOffset.x = e.clientX - rect.left - this.ctx.canvas.width / 2;
      this.mouseOffset.y = e.clientY - rect.top - this.ctx.canvas.height / 2;
      // Mouse angle
      const dx = this.mouse.x - this.pos.x;
      const dy = this.mouse.y - this.pos.y - this.height / 4;
      const angle = Math.atan2(dy, dx);
      this.mouseAngle = angle;
    });
    // handle touch on mobile
    this.ctx.canvas.addEventListener("touchstart", (e: TouchEvent) => {
      this.touches = e.touches;
      this.inputs.mouse = true;
      const touch = e.touches[e.touches.length - 1];
      const rect = this.ctx.canvas.getBoundingClientRect();
      this.mouseOffset.x =
        touch.clientX - rect.left - this.ctx.canvas.width / 2;
      this.mouseOffset.y =
        touch.clientY - rect.top - this.ctx.canvas.height / 2;
      // Mouse angle
      const dx = this.mouse.x - this.pos.x;
      const dy = this.mouse.y - this.pos.y - this.height / 4;
      const angle = Math.atan2(dy, dx);
      this.mouseAngle = angle;
    });
    this.ctx.canvas.addEventListener("touchend", (e: TouchEvent) => {
      this.touches = e.touches;
      this.inputs.mouse = false;
      this.joystickTouch = undefined;
    });
    this.ctx.canvas.addEventListener("touchmove", (e: TouchEvent) => {
      this.touches = e.touches;
      const touch = e.touches[e.touches.length - 1];
      const rect = this.ctx.canvas.getBoundingClientRect();
      this.mouseOffset.x =
        touch.clientX - rect.left - this.ctx.canvas.width / 2;
      this.mouseOffset.y =
        touch.clientY - rect.top - this.ctx.canvas.height / 2;
      // Mouse angle
      const dx = this.mouse.x - this.pos.x;
      const dy = this.mouse.y - this.pos.y - this.height / 4;
      const angle = Math.atan2(dy, dx);
      this.mouseAngle = angle;
    });

    this.hat = {
      front: new GameObject(ctx, this.pos, "assets/hatFront.png"),
      side: new GameObject(ctx, this.pos, "assets/hatSide.png"),
      back: new GameObject(ctx, this.pos, "assets/hatBack.png"),
    };

    this.width = Player.width;
    this.height = Player.height;
  }
  // update player (movement,health,energy) - called every frame
  update(state: State) {
    this.mouse.x = this.pos.x + this.mouseOffset.x;
    this.mouse.y = this.pos.y + this.mouseOffset.y;

    if (this.mobile) {
      Array.from(this.touches).forEach((t) => {
        const rect = this.ctx.canvas.getBoundingClientRect();
        let touch: Vector;
        let xOff = t.clientX - rect.left - this.ctx.canvas.width / 2;
        let yOff = t.clientY - rect.top - this.ctx.canvas.height / 2;
        touch = {
          x: this.pos.x + xOff,
          y: this.pos.y + yOff,
        };
        const joy = {
          x:
            this.joyBase.pos.x +
            this.joyBase.img.width / 4 -
            this.joyHand.img.width / 4,
          y:
            this.joyBase.pos.y +
            this.joyBase.img.height / 4 -
            this.joyHand.img.height / 4,
        };

        if (magnitude({ x: joy.x - touch.x, y: joy.y - touch.y }) < 60) {
          this.joystickTouch = t.identifier;
          console.log("touching");
        }
      });
    }

    if (state !== State.Paused && state !== State.Dead) {
      if (this.inputs.up && this.lastKey === "w") {
        this.pos.y -= this.speed;
        this.img = this.frames.imgs.up;
      }
      if (this.inputs.down && this.lastKey === "s") {
        this.pos.y += this.speed;
        this.img = this.frames.imgs.down;
      }
      if (this.inputs.left && this.lastKey === "a") {
        this.pos.x -= this.speed;
        this.img = this.frames.imgs.left;
      }
      if (this.inputs.right && this.lastKey === "d") {
        this.pos.x += this.speed;
        this.img = this.frames.imgs.right;
      }
      if (this.inputs.interact) {
        this.spawnEnemy({ x: 2135, y: 1720 });
        this.inputs.interact = false;
        this.grabbing = true;
      } else {
        this.grabbing = false;
      }
    }

    if (this.energy < 100) {
      this.energy += 0.004;
    }
    if (this.energy < 0) {
      this.energy = 0;
    }
    if (this.energy > 100) {
      this.energy = 100;
    }

    if (this.health < 100) {
      this.health += 0.02;
    }
    if (this.health > 100) {
      this.health = 100;
    }
    if (this.health < 0) {
      this.health = 0;
    }
    this.hat.front.pos = {
      x: this.pos.x - this.width / 5,
      y: this.pos.y - this.height / 2,
    };
    this.hat.back.pos = {
      x: this.pos.x - this.width / 5,
      y: this.pos.y - this.height / 2,
    };
    this.hat.side.pos = {
      x: this.pos.x - this.width / 5,
      y: this.pos.y - this.height / 2,
    };
  }
  // animate player - called every frame
  animate() {
    if (this.moving) {
      this.frames.tick += 1;
      if (this.frames.tick === 10) {
        this.frames.val += 1;
        this.frames.tick = 0;
      }

      if (this.frames.val === this.frames.max) this.frames.val = 0;
    } else {
      this.frames.tick = 9;
      this.frames.val = 0;
    }
  }
  // draw player - called every frame
  draw(state: State) {
    this.ctx.drawImage(
      this.img,
      this.width * this.frames.val,
      0,
      this.img.width / this.frames.max,
      this.img.height,
      this.pos.x,
      this.pos.y,
      this.img.width / this.frames.max,
      this.img.height
    );
    if (state !== State.Paused && state !== State.Dead) {
      switch (this.lastKey) {
        case "w":
          this.hat.back.draw(64, 64);
          break;
        case "a":
          this.hat.side.draw(64, 64);
          break;
        case "d":
          this.hat.side.draw(64, 64);
          break;
        case "s":
          this.hat.front.draw(64, 64);
      }
    }
  }
  // draw details about player - called every frame
  stats(state: State) {
    if (state !== State.Paused && state !== State.Dead) {
      // health
      this.ctx.fillStyle = "rgba(0,0,0,0.3)";
      this.ctx.fillRect(
        this.pos.x + 24 - 175,
        this.pos.y + this.ctx.canvas.height / 2 - 45,
        170,
        20
      );
      this.ctx.fillStyle = "limegreen";
      this.ctx.fillRect(
        this.pos.x + 24 - 175,
        this.pos.y + this.ctx.canvas.height / 2 - 45,
        (170 *
          (this.health < 100 ? (this.health > 0 ? this.health : 0) : 100)) /
          100,
        20
      );
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 13px Arial";
      this.ctx.fillText(
        this.health.toFixed(0).toString(),
        this.pos.x + 24 - 167,
        this.pos.y + this.ctx.canvas.height / 2 - 30
      );
      this.ctx.fillStyle = "rgba(255,255,255,0.7)";
      this.ctx.font = "13px Arial";
      this.ctx.fillText(
        "| 100",
        this.pos.x + 24 - 145 + (this.health < 100 ? 0 : 5),
        this.pos.y + this.ctx.canvas.height / 2 - 30
      );

      // energy
      this.ctx.fillStyle = "rgba(0,0,0,0.3)";
      this.ctx.fillRect(
        this.pos.x + 24 + 5,
        this.pos.y + this.ctx.canvas.height / 2 - 45,
        170,
        20
      );
      this.ctx.fillStyle = "#673ab7";
      this.ctx.fillRect(
        this.pos.x + 24 + 5,
        this.pos.y + this.ctx.canvas.height / 2 - 45,
        (170 *
          (this.energy < 100 ? (this.energy > 0 ? this.energy : 0) : 100)) /
          100,
        20
      );

      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 13px Arial";
      this.ctx.fillText(
        this.energy.toFixed(0).toString(),
        this.pos.x + 37,
        this.pos.y + this.ctx.canvas.height / 2 - 30
      );
      this.ctx.fillStyle = "rgba(255,255,255,0.7)";
      this.ctx.font = "13px Arial";
      this.ctx.fillText(
        "| 100",
        this.pos.x + (this.energy < 100 ? 59 : 64),
        this.pos.y + this.ctx.canvas.height / 2 - 30
      );
      // joystick
      if (this.mobile) {
        this.joyBase.draw(
          this.joyBase.img.width / 2,
          this.joyBase.img.height / 2
        );
        this.joyBase.pos = {
          x: this.pos.x - this.ctx.canvas.width / 2 + 75,
          y: this.pos.y + this.ctx.canvas.height / 2 - 124,
        };
        if (this.inputs.mouse && this.joystickTouch !== undefined) {
          console.log("doing");
          const t = Array.from(this.touches).find(
            (t) => t.identifier === this.joystickTouch
          )!;
          const rect = this.ctx.canvas.getBoundingClientRect();
          let touch: Vector;
          let xOff = t.clientX - rect.left - this.ctx.canvas.width / 2;
          let yOff = t.clientY - rect.top - this.ctx.canvas.height / 2;

          touch = {
            x: this.pos.x + xOff,
            y: this.pos.y + yOff,
          };
          const joy = {
            x:
              this.joyBase.pos.x +
              this.joyBase.img.width / 4 -
              this.joyHand.img.width / 4,
            y:
              this.joyBase.pos.y +
              this.joyBase.img.height / 4 -
              this.joyHand.img.height / 4 -
              10,
          };

          if (magnitude({ x: joy.x - touch.x, y: joy.y - touch.y }) > 60) {
            const angle = Math.atan2(touch.y - joy.y, touch.x - joy.x);
            touch.x = joy.x + Math.cos(angle) * 60;
            touch.y = joy.y + Math.sin(angle) * 60;
          }
          this.joyHand.pos = {
            x: touch.x,
            y: touch.y + this.joyHand.img.height / 8,
          };
        } else {
          this.joyHand.pos = {
            x:
              this.joyBase.pos.x +
              this.joyBase.img.width / 4 -
              this.joyHand.img.width / 4,
            y:
              this.joyBase.pos.y +
              this.joyBase.img.height / 4 -
              this.joyHand.img.height / 4,
          };
        }
        this.joyHand.draw(
          this.joyHand.img.width / 2,
          this.joyHand.img.height / 2
        );
      }
    }
  }
  // draw inventory - called every frame
  inv(state: State) {
    if (state !== State.Paused && state !== State.Dead) {
      this.inventory.draw(this);
    }
  }
}
