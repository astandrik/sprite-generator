import { Frame } from "../../types";
import { EasingUtils } from "../EasingUtils";
import { BaseAnimationHandler } from "./BaseAnimationHandler";

export class AttackAnimationHandler extends BaseAnimationHandler {
  public applyAnimation(
    pixels: Frame["pixels"],
    t: number,
    range: number = Math.PI * 1.5
  ): void {
    // Split animation into phases: anticipation, attack, and recovery
    const anticipationPhase = t < 0.2;
    const attackPhase = t >= 0.2 && t < 0.6;
    const recoveryPhase = t >= 0.6;

    // Calculate phase-specific progress
    const anticipationProgress = anticipationPhase ? t * 5 : 0;
    const attackProgress = attackPhase ? (t - 0.2) * 2.5 : 0;
    const recoveryProgress = recoveryPhase ? (t - 0.6) * 2.5 : 0;

    // Dynamic weight shift and body rotation
    const weightShift = anticipationPhase
      ? -EasingUtils.easeInBack(anticipationProgress) * 1.5
      : attackPhase
      ? EasingUtils.easeOutExpo(attackProgress) * 3
      : EasingUtils.easeOutElastic(recoveryProgress) * 1.5;

    // Body rotation for more dynamic movement
    const bodyRotation = anticipationPhase
      ? -anticipationProgress * 0.3
      : attackPhase
      ? attackProgress * 0.5
      : Math.sin(recoveryProgress * Math.PI) * 0.2;

    pixels.forEach((pixel) => {
      const relativeHeight = pixel.y / this.config.height;
      const relativeWidth = pixel.x / this.config.width;

      this.applyAttackingArmMovement(
        pixel,
        t,
        anticipationPhase,
        attackPhase,
        recoveryPhase,
        anticipationProgress,
        attackProgress,
        recoveryProgress,
        range
      );
      this.applyBodyMovement(pixel, relativeHeight, weightShift, bodyRotation);
      this.applySecondaryArmMovement(
        pixel,
        relativeHeight,
        anticipationPhase,
        attackPhase,
        recoveryPhase,
        anticipationProgress,
        attackProgress,
        recoveryProgress
      );
    });
  }

  private applyAttackingArmMovement(
    pixel: Frame["pixels"][0],
    t: number,
    anticipationPhase: boolean,
    attackPhase: boolean,
    recoveryPhase: boolean,
    anticipationProgress: number,
    attackProgress: number,
    recoveryProgress: number,
    range: number
  ): void {
    if (
      pixel.x > this.config.width * 0.6 &&
      pixel.y < this.config.height * 0.5
    ) {
      const dx = pixel.x - this.config.width / 2;
      const dy = pixel.y - this.config.height / 2;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const baseAngle = Math.atan2(dy, dx);

      // Dynamic swing angle based on phase
      let swingAngle = 0;
      if (anticipationPhase) {
        // Pull back with tension
        swingAngle =
          -EasingUtils.easeInBack(anticipationProgress) * (range * 0.2);
      } else if (attackPhase) {
        // Explosive forward motion
        swingAngle = EasingUtils.easeOutExpo(attackProgress) * range * 1.2;
      } else {
        // Natural follow-through and recovery
        swingAngle =
          range - EasingUtils.easeOutElastic(recoveryProgress) * range * 0.3;
      }

      // Apply arm rotation with dynamic adjustments
      const dynamicRadius = radius * (1 + Math.sin(t * Math.PI) * 0.1);
      pixel.x =
        this.config.width / 2 +
        dynamicRadius * Math.cos(baseAngle + swingAngle);
      pixel.y =
        this.config.height / 2 +
        dynamicRadius * Math.sin(baseAngle + swingAngle);
    }
  }

  private applyBodyMovement(
    pixel: Frame["pixels"][0],
    relativeHeight: number,
    weightShift: number,
    bodyRotation: number
  ): void {
    if (pixel.y < this.config.height * 0.8) {
      const bodyFactor = Math.pow(1 - relativeHeight, 1.2);

      // Horizontal weight shift
      pixel.x += weightShift * bodyFactor;

      // Body rotation around center of mass
      const rotationOrigin = this.config.width / 2;
      const rotationOffset = (pixel.x - rotationOrigin) * bodyRotation;
      pixel.x =
        rotationOrigin + (pixel.x - rotationOrigin) * (1 + bodyRotation * 0.1);
      pixel.y += rotationOffset * 0.2;
    }
  }

  private applySecondaryArmMovement(
    pixel: Frame["pixels"][0],
    relativeHeight: number,
    anticipationPhase: boolean,
    attackPhase: boolean,
    recoveryPhase: boolean,
    anticipationProgress: number,
    attackProgress: number,
    recoveryProgress: number
  ): void {
    if (
      pixel.x < this.config.width * 0.4 &&
      pixel.y < this.config.height * 0.5
    ) {
      const counterBalance = anticipationPhase
        ? Math.sin(anticipationProgress * Math.PI) * 0.5
        : attackPhase
        ? -Math.sin(attackProgress * Math.PI) * 1
        : -Math.sin(recoveryProgress * Math.PI) * 0.3;

      pixel.x += counterBalance * (1 - relativeHeight);
      pixel.y += counterBalance * 0.5 * (1 - relativeHeight);
    }
  }
}
