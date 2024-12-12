import { Frame } from "../../types";
import { EasingUtils } from "../EasingUtils";
import { BaseAnimationHandler } from "./BaseAnimationHandler";

export class IdleAnimationHandler extends BaseAnimationHandler {
  public applyAnimation(
    pixels: Frame["pixels"],
    t: number,
    intensity: number = 1.5
  ): void {
    const breathOffset = EasingUtils.breathing(t) * intensity;
    const swayPhase = t * Math.PI * 2;
    // Combine multiple frequencies for more natural sway
    const swayOffset =
      Math.sin(swayPhase) * 0.2 + // Primary sway
      Math.sin(swayPhase * 0.5) * 0.1; // Slower secondary sway

    // Add slight forward lean to simulate natural standing pose
    const posturalLean = 0.3;

    pixels.forEach((pixel) => {
      // Calculate vertical position relative to character height
      const relativeHeight = pixel.y / this.config.height;
      const heightFactor = Math.max(0, 1 - relativeHeight * 2);

      // Apply breathing with more natural distribution
      const breathFactor = Math.pow(heightFactor, 1.2); // Non-linear falloff
      pixel.y += breathOffset * breathFactor;

      // Natural standing posture with weight distribution
      if (pixel.y < this.config.height * 0.9) {
        const postureFactor = 1 - Math.pow(relativeHeight, 2);
        pixel.x += posturalLean * postureFactor;
      }

      // Enhanced upper body sway with natural weight shift
      if (pixel.y < this.config.height * 0.7) {
        const swayFactor = Math.pow(
          1 - pixel.y / (this.config.height * 0.7),
          1.3
        );
        pixel.x += swayOffset * swayFactor;

        // Add subtle vertical motion to simulate natural balance adjustments
        pixel.y += Math.sin(swayPhase * 1.5) * 0.1 * swayFactor;
      }

      // More natural arm movement with shoulder rotation
      if (
        pixel.x < this.config.width * 0.3 ||
        pixel.x > this.config.width * 0.7
      ) {
        const isLeftArm = pixel.x < this.config.width * 0.3;
        const armFactor =
          Math.abs(this.config.width / 2 - pixel.x) / (this.config.width / 2);
        const armPhase = swayPhase + (isLeftArm ? Math.PI : 0);

        // Combine multiple movements for more natural arm motion
        const armMovement =
          Math.sin(armPhase * 0.5) * 0.4 + // Primary swing
          Math.sin(armPhase * 0.25) * 0.2; // Slower secondary movement

        pixel.y += armMovement * armFactor;
        // Add subtle forward/backward motion
        pixel.x += Math.cos(armPhase * 0.5) * 0.2 * armFactor;
      }
    });
  }
}
