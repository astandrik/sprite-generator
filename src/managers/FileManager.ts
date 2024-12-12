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
      version: "1.0.0",
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
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}
