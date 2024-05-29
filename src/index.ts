import { remap } from "./utils";
import { sdf } from "./lib";

export type ImageDataInput = ArrayLike<number>;

export type GetFilledParams = {
  invert?: boolean;
  threshold?: number;
  alpha?: boolean;
};

export type GenerateSdfParams = {
  width: number;
  normalize?: boolean;
  outMin?: number;
  outMax?: number;
};

export const getFilled = (
  imageData: ImageDataInput,
  params?: GetFilledParams
) => {
  const filled: boolean[] = [];

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    const isFilled = params?.alpha
      ? a < (params?.threshold || 255 / 2)
      : (r + g + b) / 3 < (params?.threshold || 255 / 2);

    filled.push(params?.invert ? !isFilled : isFilled);
  }

  return filled;
};

export const getDistances = (
  imageData: ImageDataInput,
  params: GenerateSdfParams & GetFilledParams
) => {
  const filled = getFilled(imageData, params);
  return sdf(filled, params.width);
};

export const generateSdf = (
  imageData: ImageDataInput,
  params: GenerateSdfParams & GetFilledParams
) => {
  const distances = getDistances(imageData, params);

  let inMaxValue = 0;
  let inMinValue = Infinity;
  const outMaxValue = params.outMax || 255;
  const outMinValue = params.outMin || 0;

  const doNormalize =
    params.normalize || typeof params.normalize === "undefined";

  if (doNormalize) {
    for (const distance of distances) {
      if (distance > inMaxValue) inMaxValue = distance;
      if (distance < inMinValue) inMinValue = distance;
    }
  }

  const newImageData: number[] = [];

  for (let i = 0; i < distances.length; i++) {
    const rawDistance = distances[i];

    if (doNormalize) {
      const distance = remap(
        rawDistance,
        inMinValue,
        inMaxValue,
        outMinValue,
        outMaxValue
      );

      newImageData.push(distance);
    } else {
      newImageData.push(rawDistance);
    }
  }

  return new Float32Array(newImageData);
};
