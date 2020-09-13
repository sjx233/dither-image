import ciede2000 = require("./ciede2000");

function linearize(u: number): number {
  return u <= 0.04045 ? 0.07739938080495357 * u : ((u + 0.055) / 1.055) ** 2.4;
}

function f(t: number): number {
  return t > 0.008856451679035631 ? Math.cbrt(t) : 7.787037037037037 * t + 0.13793103448275862;
}

function rgbToLab(r: number, g: number, b: number, buf: Float64Array, index: number): void {
  r = linearize(0.00392156862745098 * r);
  g = linearize(0.00392156862745098 * g);
  b = linearize(0.00392156862745098 * b);
  const x = (0.41239080 * r + 0.35758434 * g + 0.18048079 * b) / 95.0489;
  const y = (0.21263901 * r + 0.71516868 * g + 0.07219232 * b) / 100;
  const z = (0.01933082 * r + 0.11919478 * g + 0.95053215 * b) / 108.8840;
  buf[index] = 116 * f(y) - 16;
  buf[index + 1] = 500 * (f(x) - f(y));
  buf[index + 2] = 200 * (f(y) - f(z));
}

function paletteRgbToLab(palette: Uint8ClampedArray): Float64Array {
  const length = palette.length;
  const result = new Float64Array(length);
  for (let i = 0; i < length; i += 3)
    rgbToLab(palette[i], palette[i + 1], palette[i + 2], result, i);
  return result;
}

function closestColor(l: number, a: number, b: number, palette: Float64Array): number {
  let minDiff = Infinity;
  let index = -1;
  for (let i = 0, len = palette.length / 3; i < len; i++) {
    const t = i * 3;
    const diff = ciede2000(l, a, b, palette[t], palette[t + 1], palette[t + 2]);
    if (diff < minDiff) {
      minDiff = diff;
      index = i;
    }
  }
  return index;
}

function ditherImage(width: number, height: number, data: ArrayLike<number>, palette: ArrayLike<number>): Uint32Array {
  if (data.length !== width * height * 4) throw new RangeError("Size of data is invalid");
  if (palette.length === 0) throw new RangeError("Palette is empty");
  if (palette.length % 3 !== 0) throw new RangeError("Size of palette is not a multiple of 3");
  const rgbaData = new Uint8ClampedArray(data);
  const rgbPalette = new Uint8ClampedArray(palette);
  const labPalette = paletteRgbToLab(rgbPalette);
  const size = width * height;
  const result = new Uint32Array(size);
  const buf = new Float64Array(3);
  for (let i = 0; i < size; i++) {
    const c0 = i << 2;
    const c1 = (i + width) << 2;
    let r = rgbaData[c0];
    let g = rgbaData[c0 + 1];
    let b = rgbaData[c0 + 2];
    rgbToLab(r, g, b, buf, 0);
    const t = (result[i] = closestColor(buf[0], buf[1], buf[2], labPalette)) * 3;
    r -= rgbPalette[t];
    g -= rgbPalette[t + 1];
    b -= rgbPalette[t + 2];
    rgbaData[c0 + 4] += r * 0.4375;
    rgbaData[c0 + 5] += g * 0.4375;
    rgbaData[c0 + 6] += b * 0.4375;
    rgbaData[c1 - 4] += r * 0.1875;
    rgbaData[c1 - 3] += g * 0.1875;
    rgbaData[c1 - 2] += b * 0.1875;
    rgbaData[c1] += r * 0.3125;
    rgbaData[c1 + 1] += g * 0.3125;
    rgbaData[c1 + 2] += b * 0.3125;
    rgbaData[c1 + 4] += r * 0.0625;
    rgbaData[c1 + 5] += g * 0.0625;
    rgbaData[c1 + 6] += b * 0.0625;
  }
  return result;
}

export = ditherImage;
