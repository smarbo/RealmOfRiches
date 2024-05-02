export type Vector = {
  x: number;
  y: number;
};

export function rotateVector(vec: Vector, angle: number): Vector {
  vec.x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
  vec.y = vec.x * Math.sin(angle) - vec.y * Math.cos(angle);
  return vec;
}
