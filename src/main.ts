import { clamp, loadImage, remap } from "./utils";
import { sdf } from "./lib";

(async () => {
  const image = await loadImage("/atom.png");
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Can't get 2d context");
  }

  // Set canvas size
  canvas.width = image.width * 0.5;
  canvas.height = image.height * 0.5;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Make image black and white
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const inFilled: boolean[] = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const isFilled = (r + g + b) / 3 < 255 / 2;
    inFilled.push(isFilled);

    for (let j = 0; j < 3; j++) {
      imageData.data[i + j] = isFilled ? 255 : 0;
    }

    imageData.data[i + 3] = 255;
  }

  const t = sdf(inFilled, canvas.width);

  let maxValue = 0;
  let minValue = Infinity;

  for (const distance of t) {
    if (distance > maxValue) maxValue = distance;
    if (distance < minValue) minValue = distance;
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    const distance = remap(t[i / 4], minValue, maxValue, 0, 255);

    for (let j = 0; j < 3; j++) {
      imageData.data[i + j] = clamp(distance, 0, 255);
    }

    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
})();
