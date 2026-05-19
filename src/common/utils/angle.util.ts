export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function angleDifference(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}
