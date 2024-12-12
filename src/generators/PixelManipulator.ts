import { Frame, SpriteConfig } from "../types";

export class PixelManipulator {
  constructor(private config: SpriteConfig) {}

  public updateFramePixel(
    frame: Frame,
    x: number,
    y: number,
    color: string
  ): Frame {
    const pixelIndex = frame.pixels.findIndex(
      (p) =>
        Math.floor(p.x) === Math.floor(x / this.config.scale) &&
        Math.floor(p.y) === Math.floor(y / this.config.scale)
    );

    const newPixels = [...frame.pixels];

    if (pixelIndex === -1) {
      newPixels.push({
        x: Math.floor(x / this.config.scale),
        y: Math.floor(y / this.config.scale),
        color,
      });
    } else {
      newPixels[pixelIndex] = {
        ...newPixels[pixelIndex],
        color,
      };
    }

    return { ...frame, pixels: newPixels };
  }

  public removeFramePixel(frame: Frame, x: number, y: number): Frame {
    const pixels = frame.pixels.filter(
      (p) =>
        Math.floor(p.x) !== Math.floor(x / this.config.scale) ||
        Math.floor(p.y) !== Math.floor(y / this.config.scale)
    );

    return { ...frame, pixels };
  }
}
