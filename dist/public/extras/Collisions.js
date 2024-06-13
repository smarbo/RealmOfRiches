const collisionsJson = await (await fetch("/Collisions.json")).json();
export const { newMapCollisions, rorMapCollisions, houseInteriorCollisions } = collisionsJson;
