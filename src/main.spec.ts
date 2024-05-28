import Jimp from "jimp";
import path from "path";
import { generateSdf } from "./main";

test("Main", async () => {
  const image = await Jimp.read(
    path.join(__dirname, "../assets/atom-small.png")
  );

  const imageData = new Uint8Array(image.bitmap.data.buffer);

  const sdf = generateSdf(imageData, {
    width: image.getWidth(),
  });

  expect(sdf.length).toBe(imageData.length);
});
