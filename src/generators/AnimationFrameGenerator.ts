import { AnimationState, Frame, SpriteConfig } from "../types";
import { EasingUtils } from "./EasingUtils";

export class AnimationFrameGenerator {
  constructor(private config: SpriteConfig) {}

  public generateAnimationFrame(
    baseFrame: Frame,
    state: AnimationState,
    frameIndex: number
  ): Frame {
    // Create deep copy of pixels
    const newPixels = baseFrame.pixels.map((p) => ({ ...p }));
    const animConfig = this.config.animations.find(
      (a) => a.state === state
    )?.config;

    if (!animConfig) return baseFrame;

    // Calculate normalized time (0 to 1) for the current frame
    const totalFrames =
      this.config.animations.find((a) => a.state === state)?.frames ?? 1;
    const t = frameIndex / (totalFrames - 1);

    switch (state) {
      case AnimationState.IDLE:
        this.applyIdleAnimation(newPixels, t, animConfig.breathingIntensity);
        break;

      case AnimationState.WALK:
        this.applyWalkAnimation(newPixels, t, animConfig.walkingSpeed);
        break;

      case AnimationState.ATTACK:
        this.applyAttackAnimation(newPixels, t, animConfig.attackRange);
        break;
    }

    return {
      id: `${state}-${frameIndex}`,
      pixels: newPixels,
      state,
      index: frameIndex,
    };
  }

  private applyIdleAnimation(
    pixels: Frame["pixels"],
    t: number,
    intensity: number = 1.5
  ): void {
    const breathPhase = EasingUtils.easeInOutSine(t) * 2 * Math.PI;
    const breathOffset = Math.sin(breathPhase) * intensity;

    pixels.forEach((pixel) => {
      // Apply breathing effect with smooth falloff based on height
      const heightFactor = Math.max(0, 1 - pixel.y / (this.config.height / 2));
      pixel.y += breathOffset * heightFactor;
    });
  }

  private applyWalkAnimation(
    pixels: Frame["pixels"],
    t: number,
    speed: number = 3
  ): void {
    const cycle = EasingUtils.easeInOutQuad(t) * 2 * Math.PI;
    const walkOffset = Math.sin(cycle) * speed;
    const bounceOffset = Math.abs(Math.sin(cycle)) * 2;

    pixels.forEach((pixel) => {
      const isLeftSide = pixel.x < this.config.width / 2;

      // Legs movement with improved physics
      if (pixel.y > this.config.height * 0.7) {
        const legFactor =
          (pixel.y - this.config.height * 0.7) / (this.config.height * 0.3);
        if (isLeftSide) {
          pixel.x += walkOffset * legFactor;
          pixel.y -= bounceOffset * (1 - legFactor);
        } else {
          pixel.x -= walkOffset * legFactor;
          pixel.y += bounceOffset * (1 - legFactor);
        }
      }

      // Arms movement with natural swing
      if (
        pixel.y < this.config.height * 0.5 &&
        (pixel.x < this.config.width * 0.3 || pixel.x > this.config.width * 0.7)
      ) {
        const armFactor =
          Math.abs(this.config.width / 2 - pixel.x) / (this.config.width / 2);
        if (isLeftSide) {
          pixel.x -= walkOffset * armFactor;
        } else {
          pixel.x += walkOffset * armFactor;
        }
      }

      // Body bounce with smooth transition
      if (
        pixel.y >= this.config.height * 0.5 &&
        pixel.y <= this.config.height * 0.7
      ) {
        const bodyFactor =
          (pixel.y - this.config.height * 0.5) / (this.config.height * 0.2);
        pixel.y += Math.sin(cycle) * 1.5 * (1 - bodyFactor);
      }
    });
  }

  private applyAttackAnimation(
    pixels: Frame["pixels"],
    t: number,
    range: number = Math.PI * 1.5
  ): void {
    const attackProgress = EasingUtils.easeInOutQuad(t);
    const attackAngle = attackProgress * range;
    const forwardLean = Math.sin(attackProgress * Math.PI) * 2;

    pixels.forEach((pixel) => {
      // Right arm attack swing with improved arc
      if (
        pixel.x > this.config.width * 0.7 &&
        pixel.y < this.config.height * 0.5
      ) {
        const dx = pixel.x - this.config.width / 2;
        const dy = pixel.y - this.config.height / 2;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const baseAngle = Math.atan2(dy, dx);
        // Add acceleration to the swing
        const swingAngle =
          attackAngle * (1 + 0.5 * Math.sin(attackProgress * Math.PI));
        pixel.x =
          this.config.width / 2 + radius * Math.cos(baseAngle + swingAngle);
        pixel.y =
          this.config.height / 2 + radius * Math.sin(baseAngle + swingAngle);
      }

      // Body lean forward with weight shift
      if (pixel.y < this.config.height * 0.7) {
        const leanFactor = 1 - pixel.y / (this.config.height * 0.7);
        pixel.x += forwardLean * leanFactor;
      }
    });
  }
}
