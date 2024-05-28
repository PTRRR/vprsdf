import { loadImage } from "./utils";

(async () => {
  const image = await loadImage("/atom-small.png");
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

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const isClosed = (r + g + b) / 3 < 255 / 2;

    for (let j = 0; j < 3; j++) {
      imageData.data[i + j] = isClosed ? 255 : 0;
    }

    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
})();
