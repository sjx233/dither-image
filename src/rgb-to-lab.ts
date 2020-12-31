function linearize(u: number): number {
  return u <= 0.04045 ? 0.07739938080495357 * u : ((u + 0.055) / 1.055) ** 2.4;
}

function f(t: number): number {
  return t > 0.008856451679035631 ? Math.cbrt(t) : 7.787037037037037 * t + 0.13793103448275862;
}

function rgbToLab(r: number, g: number, b: number, buf: Float32Array, index: number): void {
  r = linearize(r);
  g = linearize(g);
  b = linearize(b);
  const x = (0.41239080 * r + 0.35758434 * g + 0.18048079 * b) / 95.0489;
  const y = (0.21263901 * r + 0.71516868 * g + 0.07219232 * b) / 100;
  const z = (0.01933082 * r + 0.11919478 * g + 0.95053215 * b) / 108.8840;
  buf[index] = 116 * f(y) - 16;
  buf[index + 1] = 500 * (f(x) - f(y));
  buf[index + 2] = 200 * (f(y) - f(z));
}

export = rgbToLab;
