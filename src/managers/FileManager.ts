import { CharacterSprite, Frame } from "../types";
import { SpriteGenerator } from "../SpriteGenerator";
import { CanvasManager } from "./CanvasManager";

export class FileManager {
  constructor(
    private spriteGenerator: SpriteGenerator,
    private canvasManager: CanvasManager
  ) {}

  public saveSprite(
    currentSprite: CharacterSprite,
    currentFrame: Frame | null
  ): void {
    if (!currentSprite) {
      throw new Error("No sprite to save");
    }

    const spriteData = {
      sprite: currentSprite,
      version: "1.1.0", // Updated version to reflect character config support
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(spriteData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sprite-${
      currentFrame?.state || "custom"
    }-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  public loadSprite(): Promise<CharacterSprite> {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (!e.target) {
              throw new Error("Failed to read file");
            }
            const data = JSON.parse(e.target.result as string);
            if (data.sprite && data.version) {
              if (
                !data.sprite ||
                !Array.isArray(data.sprite.frames) ||
                !data.sprite.config
              ) {
                throw new Error("Invalid sprite data format");
              }
              resolve(data.sprite as CharacterSprite);
            } else {
              throw new Error("Invalid sprite file format");
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }

  public downloadSpriteSheet(currentSprite: CharacterSprite): void {
    if (!currentSprite) {
      throw new Error("No sprite to download");
    }

    const tempCanvas = this.canvasManager.createTempCanvas(
      currentSprite.width * currentSprite.frames.length,
      currentSprite.height
    );
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("Failed to create download context");
    }

    currentSprite.frames.forEach((frame, index) => {
      const frameImage = this.spriteGenerator.renderFrame(frame);
      tempCtx.putImageData(frameImage, index * currentSprite.width, 0);
    });

    this.downloadCanvas(tempCanvas, "sprite-sheet.png");
  }

  public downloadCurrentFrame(
    currentFrame: Frame,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (!currentFrame) {
      throw new Error("No frame to download");
    }

    const tempCanvas = this.canvasManager.createTempCanvas(
      canvasWidth,
      canvasHeight
    );
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("Failed to create download context");
    }

    const frameImage = this.spriteGenerator.renderFrame(currentFrame);
    tempCtx.putImageData(frameImage, 0, 0);

    this.downloadCanvas(
      tempCanvas,
      `frame-${currentFrame.state}-${currentFrame.index}.png`
    );
  }

  private downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
    // Get the trimmed canvas
    const trimmedCanvas = this.trimCanvas(canvas);

    const link = document.createElement("a");
    link.download = filename;
    link.href = trimmedCanvas.toDataURL("image/png");
    link.click();
  }

  public async downloadAnimationsSeparately(
    currentSprite: CharacterSprite
  ): Promise<void> {
    if (!currentSprite) {
      throw new Error("No sprite to download");
    }

    // Import JSZip dynamically
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Group frames by animation state
    const framesByState = currentSprite.frames.reduce((acc, frame) => {
      if (!acc[frame.state]) {
        acc[frame.state] = [];
      }
      acc[frame.state].push(frame);
      return acc;
    }, {} as Record<string, Frame[]>);

    // Create promises for all frame processing
    const promises = Object.entries(framesByState).flatMap(([state, frames]) =>
      frames.map(async (frame, index) => {
        const tempCanvas = this.canvasManager.createTempCanvas(
          currentSprite.width * currentSprite.config.scale,
          currentSprite.height * currentSprite.config.scale
        );
        const tempCtx = tempCanvas.getContext("2d");

        if (!tempCtx) {
          throw new Error("Failed to create download context");
        }

        // Render frame and put it on canvas
        const frameImage = this.spriteGenerator.renderFrame(frame);
        tempCtx.putImageData(frameImage, 0, 0);

        // Trim the canvas
        const trimmedCanvas = this.trimCanvas(tempCanvas);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          trimmedCanvas.toBlob((b) => resolve(b!), "image/png");
        });

        // Add to zip
        zip.file(`${state}${index + 1}.png`, blob);
      })
    );

    // Wait for all frames to be processed
    await Promise.all(promises);

    // Generate zip file
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `animations-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    const bound = {
      top: null as number | null,
      left: null as number | null,
      right: null as number | null,
      bottom: null as number | null,
    };

    // Scan from top to bottom, left to right
    for (let i = 0; i < l; i += 4) {
      if (pixels.data[i + 3] !== 0) {
        const y = Math.floor(i / (4 * canvas.width));
        const x = (i / 4) % canvas.width;

        if (bound.top === null) bound.top = y;
        if (bound.left === null) bound.left = x;
        else bound.left = Math.min(x, bound.left);

        if (bound.right === null) bound.right = x;
        else bound.right = Math.max(x, bound.right);

        if (bound.bottom === null) bound.bottom = y;
        else bound.bottom = Math.max(y, bound.bottom);
      }
    }

    // Handle empty canvas or invalid bounds
    if (
      bound.top === null ||
      bound.left === null ||
      bound.right === null ||
      bound.bottom === null
    ) {
      return canvas;
    }

    // Add padding of 1 pixel
    const padding = 1;
    const top = Math.max(0, bound.top - padding);
    const left = Math.max(0, bound.left - padding);
    const right = Math.min(canvas.width - 1, bound.right + padding);
    const bottom = Math.min(canvas.height - 1, bound.bottom + padding);

    const trimmed = this.canvasManager.createTempCanvas(
      right - left + 1,
      bottom - top + 1
    );
    const trimmedCtx = trimmed.getContext("2d");
    if (!trimmedCtx) throw new Error("Failed to get trimmed canvas context");

    // Copy the trimmed portion to the new canvas
    trimmedCtx.drawImage(
      canvas,
      left,
      top,
      right - left + 1,
      bottom - top + 1,
      0,
      0,
      right - left + 1,
      bottom - top + 1
    );

    return trimmed;
  }
}
