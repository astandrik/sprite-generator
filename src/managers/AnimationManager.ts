import { Frame, CharacterSprite, AnimationState } from "../types";
import { CanvasManager } from "./CanvasManager";

export class AnimationManager {
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private currentFrame: Frame | null = null;
  private currentSprite: CharacterSprite | null = null;

  constructor(private canvasManager: CanvasManager) {}

  public getCurrentFrame(): Frame | null {
    return this.currentFrame;
  }

  public getCurrentSprite(): CharacterSprite | null {
    return this.currentSprite;
  }

  public setCurrentSprite(sprite: CharacterSprite): void {
    this.currentSprite = sprite;
    if (sprite.frames.length > 0) {
      this.currentFrame = sprite.frames[0];
      this.renderCurrentFrame();
    }
  }

  public setCurrentFrame(frame: Frame): void {
    this.currentFrame = frame;
    this.renderCurrentFrame();
  }

  private renderCurrentFrame(): void {
    if (this.currentFrame) {
      this.canvasManager.renderFrame(this.currentFrame);
    }
  }

  public toggleAnimation(): boolean {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.lastFrameTime = performance.now();
      this.updateAnimationPreview(this.lastFrameTime);
    } else {
      this.stopAnimation();
    }

    return this.isPlaying;
  }

  public stopAnimation(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateAnimationPreview(timestamp: number): void {
    if (!this.isPlaying || !this.currentSprite || !this.currentFrame) return;

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

  public navigateFrames(delta: number): void {
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
  }

  public getFrameInfo(): string | null {
    if (!this.currentFrame || !this.currentSprite) return null;

    const animation = this.currentSprite.config.animations.find(
      (a) => a.state === this.currentFrame?.state
    );

    return `${this.currentFrame.state} - Frame ${
      this.currentFrame.index + 1
    } of ${animation?.frames || 0}`;
  }
}
