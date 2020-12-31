import ciede2000 = require("./ciede2000");
import rgbToLab = require("./rgb-to-lab");

function ditherImage(width: number, height: number, data: ArrayLike<number>, palette: ArrayLike<number>): Uint32Array {
  const size = width * height;
  if (data.length !== size << 2)
    throw new RangeError("Size of data is invalid");
  if (palette.length === 0)
    throw new RangeError("Palette is empty");
  if (palette.length % 3 !== 0)
    throw new RangeError("Size of palette is not a multiple of 3");
  const rgbData = new Float32Array(size * 3);
  const alpha = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const s = i << 2;
    const d = i * 3;
    rgbData[d] = data[s] / 255.0;
    rgbData[d + 1] = data[s + 1] / 255.0;
    rgbData[d + 2] = data[s + 2] / 255.0;
    alpha[i] = data[s + 3] / 255.0;
  }
  const paletteSize = palette.length / 3;
  const rgbPalette = new Float32Array(paletteSize * 3);
  for (let i = 0; i < paletteSize; i++) {
    const t = i * 3;
    rgbPalette[t] = palette[t] / 255.0;
    rgbPalette[t + 1] = palette[t + 1] / 255.0;
    rgbPalette[t + 2] = palette[t + 2] / 255.0;
  }
  const labPalette = new Float32Array(paletteSize * 3);
  for (let i = 0; i < paletteSize; i++) {
    const t = i * 3;
    rgbToLab(
      rgbPalette[t],
      rgbPalette[t + 1],
      rgbPalette[t + 2],
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
    const m = alpha[i];
    const rN = (rO - rgbPalette[t]) * m;
    const gN = (gO - rgbPalette[t + 1]) * m;
    const bN = (bO - rgbPalette[t + 2]) * m;
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
