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

    // Sort pixels by effects - render base pixels first, then glowing ones
    const sortedPixels = [...frame.pixels].sort((a, b) => {
      const aIsGlow = a.color.startsWith("rgba");
      const bIsGlow = b.color.startsWith("rgba");
      return aIsGlow === bIsGlow ? 0 : aIsGlow ? 1 : -1;
    });

    // Enable alpha blending for smooth effects
    this.ctx.globalCompositeOperation = "source-over";

    sortedPixels.forEach((pixel) => {
      this.ctx.fillStyle = pixel.color;

      if (pixel.color.startsWith("rgba")) {
        // For semi-transparent pixels (anti-aliasing, glow)
        this.ctx.globalAlpha = parseFloat(pixel.color.split(",")[3]);
      } else {
        this.ctx.globalAlpha = 1;
      }

      const x = Math.round(pixel.x * this.config.scale);
      const y = Math.round(pixel.y * this.config.scale);

      // For glowing pixels, add a subtle blur
      if (pixel.color.startsWith("rgba") && this.ctx.globalAlpha < 0.5) {
        this.ctx.shadowColor = pixel.color;
        this.ctx.shadowBlur = this.config.scale / 2;
      } else {
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fillRect(x, y, this.config.scale, this.config.scale);
    });

    // Reset context properties
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
    this.ctx.globalCompositeOperation = "source-over";

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}
