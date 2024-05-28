import Jimp from "jimp";
import path from "path";
import { sdf } from "../lib";

test("Lib", async () => {
  const image = await Jimp.read(
    path.join(__dirname, "../assets/atom-small.png")
  );

  const imageData = new Uint8Array(image.bitmap.data.buffer);
  const filled: boolean[] = [];

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];

    const isFilled = (r + g + b) / 3 < 255 / 2;
    filled.push(isFilled);
  }

  const out = sdf(filled, image.getWidth());

  expect(out.length).toBe(filled.length);
});
