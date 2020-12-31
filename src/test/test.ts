import * as fs from "fs";
import { PNG } from "pngjs";
import ditherImage = require("..");

const palette = [
  0, 0, 0,
  0, 0, 170,
  0, 170, 0,
  0, 170, 170,
  170, 0, 0,
  170, 0, 170,
  170, 85, 0,
  170, 170, 170,
  85, 85, 85,
  85, 85, 255,
  85, 255, 85,
  85, 255, 255,
  255, 85, 85,
  255, 85, 255,
  255, 255, 85,
  255, 255, 255,
];
const image = fs.createReadStream("test/in.png").pipe(new PNG).once("parsed", () => {
  const { width, height, data } = image;
  const size = width * height;
  const result = ditherImage(width, height, data, palette);
  for (let i = 0; i < size; i++) {
    const d = i << 2;
    const s = result[i] * 3;
    data[d] = palette[s];
    data[d + 1] = palette[s + 1];
    data[d + 2] = palette[s + 2];
  }
  image.pack().pipe(fs.createWriteStream("test/out.png"));
});
