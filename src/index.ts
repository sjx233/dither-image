import ciede2000 = require("./ciede2000");
import { clamp } from "./util";

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

function ditherImage(width: number, height: number, data: ArrayLike<number>, palette: ArrayLike<number>): Uint32Array {
  const size = width * height;
  if (data.length !== size << 2) throw new RangeError("Size of data is invalid");
  const paletteLength = palette.length;
  if (paletteLength === 0) throw new RangeError("Palette is empty");
  if (paletteLength % 3 !== 0) throw new RangeError("Size of palette is not a multiple of 3");
  const rgbData = new Float32Array(size * 3);
  for (let i = 0; i < size; i++) {
    const s = i << 2;
    const d = i * 3;
    rgbData[d] = clamp(data[s] / 255, 0, 1);
    rgbData[d + 1] = clamp(data[s + 1] / 255, 0, 1);
    rgbData[d + 2] = clamp(data[s + 2] / 255, 0, 1);
  }
  const paletteSize = paletteLength / 3;
  const rgbPalette = new Float32Array(paletteLength);
  const labPalette = new Float32Array(paletteLength);
  for (let i = 0; i < paletteSize; i++) {
    const t = i * 3;
    rgbToLab(
      rgbPalette[t] = clamp(palette[t] / 255, 0, 1),
      rgbPalette[t + 1] = clamp(palette[t + 1] / 255, 0, 1),
      rgbPalette[t + 2] = clamp(palette[t + 2] / 255, 0, 1),
      labPalette, t);
  }
  const result = new Uint32Array(size);
  const buf = new Float32Array(3);
  for (let i = 0; i < size; i++) {
    const d0 = i * 3;
    const d1 = (i + width) * 3;
    const rO = rgbData[d0];
    const gO = rgbData[d0 + 1];
    const bO = rgbData[d0 + 2];
    rgbToLab(rO, gO, bO, buf, 0);
    const l = buf[0];
    const a = buf[1];
    const b = buf[2];
    let minDiff = Infinity;
    let index = -1;
    for (let j = 0; j < paletteSize; j++) {
      const t = j * 3;
      const diff = ciede2000(l, a, b, labPalette[t], labPalette[t + 1], labPalette[t + 2]);
      if (diff < minDiff) {
        minDiff = diff;
        index = j;
      }
    }
    const t = (result[i] = index) * 3;
    const rN = rO - rgbPalette[t];
    const gN = gO - rgbPalette[t + 1];
    const bN = bO - rgbPalette[t + 2];
    rgbData[d0 + 3] += rN * 0.4375;
    rgbData[d0 + 4] += gN * 0.4375;
    rgbData[d0 + 5] += bN * 0.4375;
    rgbData[d1 - 3] += rN * 0.1875;
    rgbData[d1 - 2] += gN * 0.1875;
    rgbData[d1 - 1] += bN * 0.1875;
    rgbData[d1] += rN * 0.3125;
    rgbData[d1 + 1] += gN * 0.3125;
    rgbData[d1 + 2] += bN * 0.3125;
    rgbData[d1 + 3] += rN * 0.0625;
    rgbData[d1 + 4] += gN * 0.0625;
    rgbData[d1 + 5] += bN * 0.0625;
  }
  return result;
}

export = ditherImage;
