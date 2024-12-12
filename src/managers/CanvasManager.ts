import { Frame } from "../types";
import { SpriteGenerator } from "../SpriteGenerator";

export class CanvasManager {
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D;
  private showGrid: boolean = true;

  constructor(
    private canvas: HTMLCanvasElement,
    private previewCanvas: HTMLCanvasElement,
    private spriteGenerator: SpriteGenerator
  ) {
    const ctx = canvas.getContext("2d");
    const previewCtx = previewCanvas.getContext("2d");

    if (!ctx || !previewCtx) {
      throw new Error("Failed to get canvas context");
    }

    this.ctx = ctx;
    this.previewCtx = previewCtx;

    // Set canvas sizes
    this.canvas.width =
      spriteGenerator.config.width * spriteGenerator.config.scale;
    this.canvas.height =
      spriteGenerator.config.height * spriteGenerator.config.scale;
    this.previewCanvas.width =
      spriteGenerator.config.width * spriteGenerator.config.scale;
    this.previewCanvas.height =
      spriteGenerator.config.height * spriteGenerator.config.scale;
  }

  public toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  public isGridEnabled(): boolean {
    return this.showGrid;
  }

  private renderGrid(): void {
    if (!this.showGrid) return;

    const { width, height, scale } = this.spriteGenerator.config;
    this.ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
    this.ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * scale, 0);
      this.ctx.lineTo(x * scale, height * scale);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * scale);
      this.ctx.lineTo(width * scale, y * scale);
      this.ctx.stroke();
    }
  }

  public renderFrame(frame: Frame): void {
    if (!frame) return;

    // Clear both canvases
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.previewCtx.clearRect(
      0,
      0,
      this.previewCanvas.width,
      this.previewCanvas.height
    );

    // Render the main canvas
    const imageData = this.spriteGenerator.renderFrame(frame);
    this.ctx.putImageData(imageData, 0, 0);

    // Draw grid on main canvas if enabled
    this.renderGrid();

    // Render the preview canvas
    this.previewCtx.putImageData(imageData, 0, 0);

    // Add pixel coordinates on hover (debug info)
    const scale = this.spriteGenerator.config.scale;
    this.canvas.title = `Sprite size: ${this.spriteGenerator.config.width}x${this.spriteGenerator.config.height}\nPixel size: ${scale}x${scale}`;
  }

  public getCanvasRect(): DOMRect {
    return this.canvas.getBoundingClientRect();
  }

  public createTempCanvas(width: number, height: number): HTMLCanvasElement {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    return tempCanvas;
  }
}
