import { SpriteGenerator } from "./SpriteGenerator";
import { AnimationState, SpriteConfig } from "./types";
import { CanvasManager } from "./managers/CanvasManager";
import { AnimationManager } from "./managers/AnimationManager";
import { FileManager } from "./managers/FileManager";
import { UIManager } from "./managers/UIManager";

class App {
  private spriteGenerator: SpriteGenerator;
  private canvasManager: CanvasManager;
  private animationManager: AnimationManager;
  private fileManager: FileManager;
  private uiManager: UIManager;

  constructor() {
    // Configure sprite generation with improved animation settings
    const config: SpriteConfig = {
      width: 32,
      height: 32,
      scale: 10,
      animations: [
        {
          state: AnimationState.IDLE,
          frames: 8,
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
          frames: 12,
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
          frames: 10,
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

    // Initialize canvas manager
    const canvas = document.getElementById(
      "previewCanvas"
    ) as HTMLCanvasElement;
    const previewCanvas = document.getElementById(
      "animationPreview"
    ) as HTMLCanvasElement;

    if (!canvas || !previewCanvas) {
      throw new Error("Canvas elements not found");
    }

    this.canvasManager = new CanvasManager(
      canvas,
      previewCanvas,
      this.spriteGenerator
    );
    this.animationManager = new AnimationManager(this.canvasManager);
    this.fileManager = new FileManager(
      this.spriteGenerator,
      this.canvasManager
    );
    this.uiManager = new UIManager(
      canvas,
      this.spriteGenerator,
      this.canvasManager,
      this.animationManager,
      this.fileManager
    );
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
