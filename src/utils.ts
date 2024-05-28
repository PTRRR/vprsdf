export const loadImage = (path: string) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.src = path;
    image.addEventListener("load", () => resolve(image));
  });
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const remap = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
