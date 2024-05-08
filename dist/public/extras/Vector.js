export function magnitude(vec) {
    return Math.sqrt(vec.x ** 2 + vec.y ** 2);
}
export function rotateVector(vec, angle) {
    vec.x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    vec.y = vec.x * Math.sin(angle) - vec.y * Math.cos(angle);
    return vec;
}
