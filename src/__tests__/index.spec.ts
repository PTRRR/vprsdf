import Jimp from "jimp";
import path from "path";
import { generateSdf } from "../index";
import { clamp } from "../utils";

test("Main", async () => {
  const image = await Jimp.read(
    path.join(__dirname, "../../assets/atom-small.png")
  );

  image.resize(128, 128);

  const imageData = new Uint8Array(image.bitmap.data.buffer);

  const sdf = generateSdf(imageData, {
    width: image.getWidth(),
    invert: false,
    outMin: -1000,
    outMax: 1000,
  });

  for (let i = 0; i < sdf.length; i++) {
    const distance = clamp(sdf[i], 0, 255);
    imageData[i * 4] = distance;
    imageData[i * 4 + 1] = distance;
    imageData[i * 4 + 2] = distance;
    imageData[i * 4 + 3] = 255;
  }

  image.bitmap.data = Buffer.from(imageData);
  image.write("test.png");

  expect(sdf.length).toBe(imageData.length / 4);
});
