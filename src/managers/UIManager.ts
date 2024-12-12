import { AnimationState, Frame } from "../types";
import { SpriteGenerator } from "../SpriteGenerator";
import { CanvasManager } from "./CanvasManager";
import { AnimationManager } from "./AnimationManager";
import { FileManager } from "./FileManager";
import { CharacterType } from "../types/character";

export class UIManager {
  private selectedColor: string = "#000000";
  private isDrawing: boolean = false;
  private isErasing: boolean = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private spriteGenerator: SpriteGenerator,
    private canvasManager: CanvasManager,
    private animationManager: AnimationManager,
    private fileManager: FileManager
  ) {
    this.bindEvents();
  }

  private bindEvents(): void {
    // Button handlers
    const generateBtn = document.getElementById("generateBtn");
    const regenerateBtn = document.getElementById("regenerateBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const downloadFrameBtn = document.getElementById("downloadFrameBtn");
    const downloadSeparateBtn = document.getElementById("downloadSeparateBtn");
    const colorPicker = document.getElementById(
      "colorPicker"
    ) as HTMLInputElement;
    const prevFrameBtn = document.getElementById("prevFrameBtn");
    const nextFrameBtn = document.getElementById("nextFrameBtn");
    const drawBtn = document.getElementById("drawBtn");
    const eraseBtn = document.getElementById("eraseBtn");
    const gridBtn = document.getElementById("gridBtn");
    const playBtn = document.getElementById("playBtn");
    const saveBtn = document.getElementById("saveBtn");
    const loadBtn = document.getElementById("loadBtn");
    const stateSelect = document.getElementById(
      "animationState"
    ) as HTMLSelectElement;

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.handleSave());
    }

    if (loadBtn) {
      loadBtn.addEventListener("click", () => this.handleLoad());
    }

    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.handleGenerate());
    }

    if (regenerateBtn) {
      regenerateBtn.addEventListener("click", () => this.handleRegenerate());
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () =>
        this.handleDownloadSpriteSheet()
      );
    }

    if (downloadFrameBtn) {
      downloadFrameBtn.addEventListener("click", () =>
        this.handleDownloadFrame()
      );
    }

    if (downloadSeparateBtn) {
      downloadSeparateBtn.addEventListener("click", () =>
        this.handleDownloadSeparateAnimations()
      );
    }

    if (colorPicker) {
      colorPicker.addEventListener("input", (e) => {
        this.selectedColor = (e.target as HTMLInputElement).value;
      });
    }

    if (prevFrameBtn) {
      prevFrameBtn.addEventListener("click", () =>
        this.handleNavigateFrames(-1)
      );
    }

    if (nextFrameBtn) {
      nextFrameBtn.addEventListener("click", () =>
        this.handleNavigateFrames(1)
      );
    }

    if (drawBtn) {
      drawBtn.addEventListener("click", () => {
        this.isDrawing = true;
        this.isErasing = false;
        drawBtn.classList.add("active");
        if (eraseBtn) eraseBtn.classList.remove("active");
      });
    }

    if (eraseBtn) {
      eraseBtn.addEventListener("click", () => {
        this.isErasing = true;
        this.isDrawing = false;
        eraseBtn.classList.add("active");
        if (drawBtn) drawBtn.classList.remove("active");
      });
    }

    if (gridBtn) {
      gridBtn.addEventListener("click", () => {
        this.canvasManager.toggleGrid();
        gridBtn.classList.toggle("active");
        const currentFrame = this.animationManager.getCurrentFrame();
        if (currentFrame) {
          this.canvasManager.renderFrame(currentFrame);
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const isPlaying = this.animationManager.toggleAnimation();
        playBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
      });
    }

    if (stateSelect) {
      stateSelect.addEventListener("change", () => {
        const currentSprite = this.animationManager.getCurrentSprite();
        if (!currentSprite) return;

        const selectedState = stateSelect.value as AnimationState;
        const frame = currentSprite.frames.find(
          (f) => f.state === selectedState
        );
        if (frame) {
          this.animationManager.setCurrentFrame(frame);
          this.updateFrameInfo();
        }
      });
    }

    // Canvas event handlers
    this.canvas.addEventListener("mousedown", (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        // Left mouse button is pressed
        this.handleCanvasClick(e);
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      const currentFrame = this.animationManager.getCurrentFrame();
      if (currentFrame) {
        this.canvasManager.renderFrame(currentFrame);
      }
    });
  }

  private handleCanvasClick(event: MouseEvent): void {
    const currentFrame = this.animationManager.getCurrentFrame();
    if (!currentFrame || (!this.isDrawing && !this.isErasing)) return;

    const rect = this.canvasManager.getCanvasRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let updatedFrame: Frame;
    if (this.isDrawing) {
      updatedFrame = this.spriteGenerator.updateFramePixel(
        currentFrame,
        x,
        y,
        this.selectedColor
      );
    } else {
      updatedFrame = this.spriteGenerator.removeFramePixel(currentFrame, x, y);
    }

    this.animationManager.setCurrentFrame(updatedFrame);
  }

  private handleGenerate(): void {
    this.animationManager.stopAnimation();
    const typeSelect = document.getElementById(
      "characterType"
    ) as HTMLSelectElement;

    const type = typeSelect?.value as CharacterType;
    const sprite = this.spriteGenerator.generateSprite(type);
    this.animationManager.setCurrentSprite(sprite);
    this.updateFrameInfo();
    this.updateStateSelect();
  }

  private handleRegenerate(): void {
    this.animationManager.stopAnimation();
    const currentSprite = this.animationManager.getCurrentSprite();
    if (!currentSprite) return;

    const sprite = this.spriteGenerator.generateSprite(
      currentSprite.characterConfig.type
    );
    this.animationManager.setCurrentSprite(sprite);
    this.updateFrameInfo();
    this.updateStateSelect();
  }

  private handleSave(): void {
    const currentSprite = this.animationManager.getCurrentSprite();
    const currentFrame = this.animationManager.getCurrentFrame();
    if (currentSprite) {
      this.fileManager.saveSprite(currentSprite, currentFrame);
    }
  }

  private async handleLoad(): Promise<void> {
    try {
      this.animationManager.stopAnimation();
      const sprite = await this.fileManager.loadSprite();
      this.spriteGenerator = new SpriteGenerator(sprite.config);
      this.animationManager.setCurrentSprite(sprite);
      this.updateFrameInfo();
      this.updateStateSelect();
    } catch (error) {
      console.error("Error loading sprite:", error);
      alert("Failed to load sprite file");
    }
  }

  private handleDownloadSpriteSheet(): void {
    const currentSprite = this.animationManager.getCurrentSprite();
    if (currentSprite) {
      this.fileManager.downloadSpriteSheet(currentSprite);
    }
  }

  private handleDownloadFrame(): void {
    const currentFrame = this.animationManager.getCurrentFrame();
    if (currentFrame) {
      this.fileManager.downloadCurrentFrame(
        currentFrame,
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  private async handleDownloadSeparateAnimations(): Promise<void> {
    const currentSprite = this.animationManager.getCurrentSprite();
    if (currentSprite) {
      try {
        await this.fileManager.downloadAnimationsSeparately(currentSprite);
      } catch (error) {
        console.error("Error exporting animations:", error);
        alert("Failed to export animations");
      }
    }
  }

  private handleNavigateFrames(delta: number): void {
    this.animationManager.navigateFrames(delta);
    this.updateFrameInfo();
  }

  private updateFrameInfo(): void {
    const frameInfo = document.getElementById("frameInfo");
    if (!frameInfo) return;

    const currentSprite = this.animationManager.getCurrentSprite();
    const currentFrame = this.animationManager.getCurrentFrame();

    if (!currentSprite || !currentFrame) {
      frameInfo.textContent = "No frame selected";
      return;
    }

    const characterConfig = currentSprite.characterConfig;
    const animInfo = this.animationManager.getFrameInfo();

    // Display character type and animation info
    const characterInfo = characterConfig.type;
    frameInfo.textContent = `${characterInfo} - ${animInfo || ""}`;
  }

  private updateStateSelect(): void {
    const stateSelect = document.getElementById(
      "animationState"
    ) as HTMLSelectElement;
    const currentSprite = this.animationManager.getCurrentSprite();
    const currentFrame = this.animationManager.getCurrentFrame();

    if (!stateSelect || !currentSprite) return;

    // Get unique states
    const states = Array.from(
      new Set(currentSprite.frames.map((f) => f.state))
    );

    // Update options
    stateSelect.innerHTML = states
      .map((state) => `<option value="${state}">${state}</option>`)
      .join("");

    // Select current state
    if (currentFrame) {
      stateSelect.value = currentFrame.state;
    }
  }
}
