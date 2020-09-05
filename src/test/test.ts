import { once } from "events";
import * as fs from "fs";
import { PNG } from "pngjs";
import dither = require("../index");

const palette = [
  0x00, 0x00, 0x00,
  0x00, 0x00, 0xaa,
  0x00, 0xaa, 0x00,
  0x00, 0xaa, 0xaa,
  0xaa, 0x00, 0x00,
  0xaa, 0x00, 0xaa,
  0xaa, 0x55, 0x00,
  0xaa, 0xaa, 0xaa,
  0x55, 0x55, 0x55,
  0x55, 0x55, 0xff,
  0x55, 0xff, 0x55,
  0x55, 0xff, 0xff,
  0xff, 0x55, 0x55,
  0xff, 0x55, 0xff,
  0xff, 0xff, 0x55,
  0xff, 0xff, 0xff,
];
(async () => {
  const image = fs.createReadStream("test/in.png").pipe(new PNG);
  await once(image, "parsed");
  const data = image.data;
  const result = dither(image.width, image.height, data, palette);
  for (let i = 0, len = result.length; i < len; i++) {
    const c = i << 2;
    const t = result[i] * 3;
    data[c] = palette[t];
    data[c + 1] = palette[t + 1];
    data[c + 2] = palette[t + 2];
  }
  await once(image.pack().pipe(fs.createWriteStream("test/out.png")), "finish");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
