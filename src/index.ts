import { SpriteGenerator } from "./SpriteGenerator";
import { AnimationState, SpriteConfig, Frame, CharacterSprite } from "./types";

class App {
  private canvas: HTMLCanvasElement;
  private previewCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D;
  private spriteGenerator: SpriteGenerator;
  private currentSprite: CharacterSprite | null = null;
  private currentFrame: Frame | null = null;
  private selectedColor: string = "#000000";
  private isDrawing: boolean = false;
  private isErasing: boolean = false;
  private showGrid: boolean = true;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;

  constructor() {
    // Initialize main canvas
    const canvas = document.getElementById(
      "previewCanvas"
    ) as HTMLCanvasElement;
    if (!canvas) throw new Error("Canvas element not found");
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    this.ctx = ctx;

    // Initialize preview canvas
    const previewCanvas = document.getElementById(
      "animationPreview"
    ) as HTMLCanvasElement;
    if (!previewCanvas) throw new Error("Preview canvas not found");
    this.previewCanvas = previewCanvas;

    const previewCtx = previewCanvas.getContext("2d");
    if (!previewCtx) throw new Error("Failed to get preview canvas context");
    this.previewCtx = previewCtx;

    // Configure sprite generation with improved animation settings
    const config: SpriteConfig = {
      width: 32,
      height: 32,
      scale: 10,
      animations: [
        {
          state: AnimationState.IDLE,
          frames: 8, // Increased frames for smoother animation
          frameDelay: 150,
          config: {
            breathingIntensity: 1.2,
            colors: {
              body: "#000000",
              outline: "#444444",
            },
          },
        },
        {
          state: AnimationState.WALK,
          frames: 12, // Increased frames for smoother animation
          frameDelay: 80,
          config: {
            walkingSpeed: 2.5,
            colors: {
              body: "#000000",
              outline: "#444444",
            },
          },
        },
        {
          state: AnimationState.ATTACK,
          frames: 10, // Increased frames for smoother animation
          frameDelay: 60,
          config: {
            attackRange: Math.PI * 1.5,
            colors: {
              body: "#000000",
              outline: "#444444",
              weapon: "#666666",
            },
          },
        },
      ],
    };

    // Initialize sprite generator
    this.spriteGenerator = new SpriteGenerator(config);

    // Set canvas sizes
    this.canvas.width = config.width * config.scale;
    this.canvas.height = config.height * config.scale;
    this.previewCanvas.width = config.width * config.scale;
    this.previewCanvas.height = config.height * config.scale;

    // Bind event handlers
    this.bindEvents();
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

  private updateAnimationPreview(timestamp: number): void {
    if (!this.isPlaying || !this.currentSprite) return;

    const currentAnimation = this.currentSprite.config.animations.find(
      (a) => a.state === this.currentFrame?.state
    );

    if (!currentAnimation) return;

    const frameDelay = currentAnimation.frameDelay;
    const elapsed = timestamp - this.lastFrameTime;

    if (elapsed > frameDelay) {
      this.navigateFrames(1);
      this.lastFrameTime = timestamp;
    }

    this.animationFrameId = requestAnimationFrame(
      this.updateAnimationPreview.bind(this)
    );
  }

  private toggleAnimation(): void {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById("playBtn");

    if (this.isPlaying) {
      if (playBtn) playBtn.textContent = "⏸ Pause";
      this.lastFrameTime = performance.now();
      this.updateAnimationPreview(this.lastFrameTime);
    } else {
      if (playBtn) playBtn.textContent = "▶ Play";
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }

  private bindEvents(): void {
    // Button handlers
    const generateBtn = document.getElementById("generateBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const downloadFrameBtn = document.getElementById("downloadFrameBtn");
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
      saveBtn.addEventListener("click", () => this.saveSprite());
    }

    if (loadBtn) {
      loadBtn.addEventListener("click", () => this.loadSprite());
    }

    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.generateSprites());
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => this.downloadSpriteSheet());
    }

    if (downloadFrameBtn) {
      downloadFrameBtn.addEventListener("click", () =>
        this.downloadCurrentFrame()
      );
    }

    if (colorPicker) {
      colorPicker.addEventListener("input", (e) => {
        this.selectedColor = (e.target as HTMLInputElement).value;
      });
    }

    if (prevFrameBtn) {
      prevFrameBtn.addEventListener("click", () => this.navigateFrames(-1));
    }

    if (nextFrameBtn) {
      nextFrameBtn.addEventListener("click", () => this.navigateFrames(1));
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
        this.showGrid = !this.showGrid;
        gridBtn.classList.toggle("active");
        this.renderCurrentFrame();
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => this.toggleAnimation());
    }

    if (stateSelect) {
      stateSelect.addEventListener("change", () => {
        if (!this.currentSprite) return;
        const selectedState = stateSelect.value as AnimationState;
        const frame = this.currentSprite.frames.find(
          (f) => f.state === selectedState
        );
        if (frame) {
          this.currentFrame = frame;
          this.renderCurrentFrame();
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
      this.renderCurrentFrame();
    });
  }

  private handleCanvasClick(event: MouseEvent): void {
    if (!this.currentFrame || (!this.isDrawing && !this.isErasing)) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isDrawing) {
      this.currentFrame = this.spriteGenerator.updateFramePixel(
        this.currentFrame,
        x,
        y,
        this.selectedColor
      );
    } else if (this.isErasing) {
      this.currentFrame = this.spriteGenerator.removeFramePixel(
        this.currentFrame,
        x,
        y
      );
    }

    this.renderCurrentFrame();
  }

  private generateSprites(): void {
    try {
      this.stopAnimation();
      this.currentSprite = this.spriteGenerator.generateSprite();
      if (this.currentSprite.frames.length > 0) {
        this.currentFrame = this.currentSprite.frames[0];
        this.renderCurrentFrame();
        this.updateFrameInfo();
        this.updateStateSelect();
      }
    } catch (error) {
      console.error("Error generating sprites:", error);
      alert("Failed to generate sprite sheet");
    }
  }

  private stopAnimation(): void {
    this.isPlaying = false;
    const playBtn = document.getElementById("playBtn");
    if (playBtn) playBtn.textContent = "▶ Play";
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateStateSelect(): void {
    const stateSelect = document.getElementById(
      "animationState"
    ) as HTMLSelectElement;
    if (!stateSelect || !this.currentSprite) return;

    // Get unique states
    const states = Array.from(
      new Set(this.currentSprite.frames.map((f) => f.state))
    );

    // Update options
    stateSelect.innerHTML = states
      .map((state) => `<option value="${state}">${state}</option>`)
      .join("");

    // Select current state
    if (this.currentFrame) {
      stateSelect.value = this.currentFrame.state;
    }
  }

  private saveSprite(): void {
    if (!this.currentSprite) {
      alert("No sprite to save");
      return;
    }

    const spriteData = {
      sprite: this.currentSprite,
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
      this.currentFrame?.state || "custom"
    }-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private loadSprite(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target) {
            throw new Error("Failed to read file");
          }
          const data = JSON.parse(e.target.result as string);
          if (data.sprite && data.version) {
            this.stopAnimation();
            if (
              !data.sprite ||
              !Array.isArray(data.sprite.frames) ||
              !data.sprite.config
            ) {
              throw new Error("Invalid sprite data format");
            }
            this.currentSprite = data.sprite as CharacterSprite;
            this.currentFrame = this.currentSprite.frames[0] || null;
            this.spriteGenerator = new SpriteGenerator(
              this.currentSprite.config
            );
            this.renderCurrentFrame();
            this.updateFrameInfo();
            this.updateStateSelect();
          } else {
            throw new Error("Invalid sprite file format");
          }
        } catch (error) {
          console.error("Error loading sprite:", error);
          alert("Failed to load sprite file");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  private renderCurrentFrame(): void {
    if (!this.currentFrame) return;

    // Clear both canvases
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.previewCtx.clearRect(
      0,
      0,
      this.previewCanvas.width,
      this.previewCanvas.height
    );

    // Render the main canvas
    const imageData = this.spriteGenerator.renderFrame(this.currentFrame);
    this.ctx.putImageData(imageData, 0, 0);

    // Draw grid on main canvas if enabled
    this.renderGrid();

    // Render the preview canvas
    this.previewCtx.putImageData(imageData, 0, 0);

    // Add pixel coordinates on hover (debug info)
    const scale = this.spriteGenerator.config.scale;
    this.canvas.title = `Sprite size: ${this.spriteGenerator.config.width}x${this.spriteGenerator.config.height}\nPixel size: ${scale}x${scale}`;
  }

  private updateFrameInfo(): void {
    const frameInfo = document.getElementById("frameInfo");
    if (frameInfo && this.currentFrame) {
      const animation = this.spriteGenerator.config.animations.find(
        (a) => a.state === this.currentFrame?.state
      );

      frameInfo.textContent = `${this.currentFrame.state} - Frame ${
        this.currentFrame.index + 1
      } of ${animation?.frames || 0}`;
    }
  }

  private navigateFrames(delta: number): void {
    if (!this.currentSprite || !this.currentFrame) return;

    const currentIndex = this.currentSprite.frames.findIndex(
      (f) => f.id === this.currentFrame?.id
    );
    if (currentIndex === -1) return;

    const newIndex =
      (currentIndex + delta + this.currentSprite.frames.length) %
      this.currentSprite.frames.length;
    this.currentFrame = this.currentSprite.frames[newIndex];
    this.renderCurrentFrame();
    this.updateFrameInfo();
  }

  private downloadSpriteSheet(): void {
    if (!this.currentSprite) {
      alert("Please generate sprites first");
      return;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width =
      this.currentSprite.width * this.currentSprite.frames.length;
    tempCanvas.height = this.currentSprite.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      alert("Failed to create download context");
      return;
    }

    this.currentSprite.frames.forEach((frame, index) => {
      const frameImage = this.spriteGenerator.renderFrame(frame);
      tempCtx.putImageData(frameImage, index * this.currentSprite!.width, 0);
    });

    this.downloadCanvas(tempCanvas, "sprite-sheet.png");
  }

  private downloadCurrentFrame(): void {
    if (!this.currentFrame) {
      alert("No frame selected");
      return;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      alert("Failed to create download context");
      return;
    }

    const frameImage = this.spriteGenerator.renderFrame(this.currentFrame);
    tempCtx.putImageData(frameImage, 0, 0);

    this.downloadCanvas(
      tempCanvas,
      `frame-${this.currentFrame.state}-${this.currentFrame.index}.png`
    );
  }

  private downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
