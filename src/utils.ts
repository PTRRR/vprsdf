export const loadImage = (path: string) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.src = path;
    image.addEventListener("load", () => resolve(image));
  });
};
