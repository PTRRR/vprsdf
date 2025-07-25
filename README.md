# VPR - SDF

`vprsdf` is a fast and efficient signed distance field (SDF) generator designed for use in both Node.js and browser environments. It processes image pixel data as input and produces an array of corresponding distance values, which are normalized to a range of 0 to 255. This package operates without any external libraries, making it suitable for implementation in separate threads or web workers for asynchronous execution.

<span>
<img src="https://sdf.vpr-group.ch/KERO-IG4.webp" alt="font" width="250"/>
</span>
<span>
<img src="https://sdf.vpr-group.ch/sdf-KERO-IG4.png" alt="sdf" width="250"/>
</span>

[Font](https://ott-foundry.com/typefaces/kerozene) by [Eliott Grunewald](https://ott-foundry.com/)

This package is a port of the beautifully explained [algorithm](https://tkmikyon.medium.com/computing-the-signed-distance-field-a1fa9ba2fc7d) from [@tkmikyon](https://twitter.com/tkmikyon).

[Demo](https://sdf.vpr-group.ch/)

### Canvas Example

```ts
import { generateSdf } from "vprsdf";
import { loadImage } from "./utils";

(async () => {
  // Get canvas and context
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  // Load an image
  const image = await loadImage("/atom-small.png");

  if (!ctx) return;

  canvas.width = 400;
  canvas.height = 400;

  // Retrieve pixels from the image
  ctx.drawImage(image, 0, 0, 400, 400);
  const imageData = ctx.getImageData(0, 0, 400, 400);

  // Compute signed distance field
  const sdf = generateSdf(imageData.data, {
    width: 400,
  });

  // Update image data with distances
  for (let i = 0; i < sdf.length; i++) {
    const distance = sdf[i];

    imageData.data[i * 4] = distance;
    imageData.data[i * 4 + 1] = distance;
    imageData.data[i * 4 + 2] = distance;
    imageData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
})();
```
