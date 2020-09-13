export function floorMod(x: number, y: number): number {
  const mod = x % y;
  return (y > 0 ? mod < 0 : mod > 0) ? mod + y : mod;
}

export function wrap(x: number, low: number, high: number): number {
  return floorMod(x - low, high - low) + low;
}

export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}
