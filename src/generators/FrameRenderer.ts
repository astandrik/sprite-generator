import { Frame, SpriteConfig } from "../types";

export class FrameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(private config: SpriteConfig) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = config.width * config.scale;
    this.canvas.height = config.height * config.scale;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    this.ctx = context;
  }

  public renderFrame(frame: Frame): ImageData {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    frame.pixels.forEach((pixel) => {
      this.ctx.fillStyle = pixel.color;
      this.ctx.fillRect(
        Math.round(pixel.x * this.config.scale),
        Math.round(pixel.y * this.config.scale),
        this.config.scale,
        this.config.scale
      );
    });

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}
