import { Frame } from "../../types";
import { EasingUtils } from "../EasingUtils";
import { BaseAnimationHandler } from "./BaseAnimationHandler";

export class WalkAnimationHandler extends BaseAnimationHandler {
  public applyAnimation(
    pixels: Frame["pixels"],
    t: number,
    speed: number = 3
  ): void {
    const walkCycle = EasingUtils.walkCycle(t);
    const walkOffset = walkCycle * speed;
    const hipSway = EasingUtils.hipSway(t);
    const torsoRotation = EasingUtils.torsoRotation(t);

    // Enhanced weight distribution with momentum
    const weightShift = Math.sin(t * Math.PI * 2) * 0.7;
    const forwardLean = 0.5; // Natural forward lean while walking

    // More natural vertical movement with reduced bounce
    const verticalBounce = Math.abs(Math.sin(t * Math.PI * 2)) * 0.4;

    pixels.forEach((pixel) => {
      const isLeftSide = pixel.x < this.config.width / 2;
      const relativeHeight = pixel.y / this.config.height;
      const distanceFromCenter =
        Math.abs(pixel.x - this.config.width / 2) / (this.config.width / 2);

      this.applyBodyMovement(pixel, t, relativeHeight, forwardLean);
      this.applyTorsoMovement(pixel, torsoRotation, distanceFromCenter);
      this.applyLegMovement(pixel, t, isLeftSide, speed, hipSway);
      this.applyArmMovement(pixel, t, isLeftSide, speed, torsoRotation);
      this.applyTorsoAnimation(pixel, t, verticalBounce);
    });
  }

  private applyBodyMovement(
    pixel: Frame["pixels"][0],
    t: number,
    relativeHeight: number,
    forwardLean: number
  ): void {
    if (pixel.y < this.config.height * 0.9) {
      const leanFactor = Math.pow(1 - relativeHeight, 1.2);
      const dynamicLean = forwardLean * (1 + Math.sin(t * Math.PI * 2) * 0.2);
      pixel.x += dynamicLean * leanFactor;
    }
  }

  private applyTorsoMovement(
    pixel: Frame["pixels"][0],
    torsoRotation: number,
    distanceFromCenter: number
  ): void {
    if (
      pixel.y < this.config.height * 0.7 &&
      pixel.y > this.config.height * 0.3
    ) {
      const torsoFactor =
        (pixel.y - this.config.height * 0.3) / (this.config.height * 0.4);
      const rotationAmount =
        torsoRotation * (1 - torsoFactor) * distanceFromCenter;
      pixel.x += rotationAmount * 2;
      pixel.y += Math.abs(rotationAmount) * 0.5;
    }
  }

  private applyLegMovement(
    pixel: Frame["pixels"][0],
    t: number,
    isLeftSide: boolean,
    speed: number,
    hipSway: number
  ): void {
    if (pixel.y > this.config.height * 0.7) {
      const legFactor =
        (pixel.y - this.config.height * 0.7) / (this.config.height * 0.3);
      const legPhase = isLeftSide ? t : (t + 0.5) % 1;

      // Multi-phase leg movement
      const stridePhase = legPhase * Math.PI * 2;
      const liftPhase = ((legPhase + 0.25) % 1) * Math.PI * 2;

      // Combine movements for natural leg motion
      const legSwing =
        EasingUtils.easeInOutSine(legPhase) * speed * 1.2 + // Primary stride
        Math.sin(stridePhase * 2) * 0.3 + // Secondary motion
        Math.sin(liftPhase) * 0.2; // Tertiary adjustment

      this.applyLegDynamics(
        pixel,
        legSwing,
        legPhase,
        legFactor,
        speed,
        isLeftSide,
        stridePhase
      );

      // Add hip sway influence on legs
      pixel.x += hipSway * (1 - legFactor) * (isLeftSide ? 1 : -1);
    }
  }

  private applyLegDynamics(
    pixel: Frame["pixels"][0],
    legSwing: number,
    legPhase: number,
    legFactor: number,
    speed: number,
    isLeftSide: boolean,
    stridePhase: number
  ): void {
    const kneeBend = Math.sin(legPhase * Math.PI) * 2.5;
    const kneeRotation = Math.cos(legPhase * Math.PI * 2) * 0.3;

    if (isLeftSide) {
      const strideForward = legSwing > 0;
      const bendIntensity =
        Math.abs(legSwing / speed) * (strideForward ? 1.2 : 0.8);

      pixel.x += legSwing * legFactor;

      if (!strideForward) {
        pixel.y -= bendIntensity * kneeBend * (1 - legFactor);
        pixel.x += (bendIntensity * kneeRotation + 0.3) * legFactor;
        pixel.x += bendIntensity * 0.2 * legFactor;
      } else {
        const landingFactor = Math.max(0, Math.sin(stridePhase + Math.PI / 4));
        pixel.y += landingFactor * 0.3 * legFactor;
      }
    } else {
      const strideForward = legSwing < 0;
      const bendIntensity =
        Math.abs(legSwing / speed) * (strideForward ? 1.2 : 0.8);

      pixel.x -= legSwing * legFactor;

      if (!strideForward) {
        pixel.y -= bendIntensity * kneeBend * (1 - legFactor);
        pixel.x -= (bendIntensity * kneeRotation + 0.3) * legFactor;
        pixel.x -= bendIntensity * 0.2 * legFactor;
      } else {
        const landingFactor = Math.max(0, Math.sin(stridePhase + Math.PI / 4));
        pixel.y += landingFactor * 0.3 * legFactor;
      }
    }
  }

  private applyArmMovement(
    pixel: Frame["pixels"][0],
    t: number,
    isLeftSide: boolean,
    speed: number,
    torsoRotation: number
  ): void {
    if (
      pixel.y < this.config.height * 0.5 &&
      (pixel.x < this.config.width * 0.3 || pixel.x > this.config.width * 0.7)
    ) {
      const armFactor =
        Math.abs(this.config.width / 2 - pixel.x) / (this.config.width / 2);
      const armPhase = isLeftSide ? (t + 0.5) % 1 : t;

      // Multi-layered arm motion
      const primarySwing = EasingUtils.easeInOutSine(armPhase) * (speed * 0.8);
      const secondarySwing = Math.sin(armPhase * Math.PI * 3) * 0.3;
      const microAdjustment = Math.sin(armPhase * Math.PI * 6) * 0.1;

      const armSwing = primarySwing + secondarySwing + microAdjustment;

      this.applyArmDynamics(
        pixel,
        armSwing,
        armPhase,
        armFactor,
        speed,
        isLeftSide,
        torsoRotation
      );
    }
  }

  private applyArmDynamics(
    pixel: Frame["pixels"][0],
    armSwing: number,
    armPhase: number,
    armFactor: number,
    speed: number,
    isLeftSide: boolean,
    torsoRotation: number
  ): void {
    const shoulderRotation = Math.sin(armPhase * Math.PI * 2) * 0.5;
    const shoulderLift = Math.cos(armPhase * Math.PI * 2) * 0.3;
    const elbowPhase = (armPhase + 0.25) % 1;
    const baseBend = Math.sin(elbowPhase * Math.PI * 2 + Math.PI);
    const elbowBend = baseBend * 0.4 * (1 - Math.abs(armSwing) / speed);
    const armTwist = Math.sin(armPhase * Math.PI * 2) * 0.2;

    if (isLeftSide) {
      pixel.x -= armSwing * armFactor;
      pixel.y += (shoulderRotation + shoulderLift) * armFactor;
      if (pixel.y > this.config.height * 0.3) {
        const elbowFactor =
          (pixel.y - this.config.height * 0.3) / (this.config.height * 0.2);
        pixel.x += elbowBend * armFactor * elbowFactor;
        pixel.x += armTwist * armFactor * (1 - elbowFactor);
      }
      pixel.z = (armSwing * 0.3 + elbowBend * 0.2) * armFactor;
    } else {
      pixel.x += armSwing * armFactor;
      pixel.y += (shoulderRotation + shoulderLift) * armFactor;
      if (pixel.y > this.config.height * 0.3) {
        const elbowFactor =
          (pixel.y - this.config.height * 0.3) / (this.config.height * 0.2);
        pixel.x -= elbowBend * armFactor * elbowFactor;
        pixel.x -= armTwist * armFactor * (1 - elbowFactor);
      }
      pixel.z = (-armSwing * 0.3 - elbowBend * 0.2) * armFactor;
    }

    pixel.x += torsoRotation * armFactor * 1.5;
    pixel.y += Math.abs(torsoRotation) * armFactor * 0.5;
  }

  private applyTorsoAnimation(
    pixel: Frame["pixels"][0],
    t: number,
    verticalBounce: number
  ): void {
    if (
      pixel.y >= this.config.height * 0.5 &&
      pixel.y <= this.config.height * 0.7
    ) {
      const bodyFactor =
        (pixel.y - this.config.height * 0.5) / (this.config.height * 0.2);
      const horizontalFactor =
        (pixel.x - this.config.width / 2) / (this.config.width / 2);

      const primaryBounce = verticalBounce * (1 - bodyFactor) * 0.7;
      const secondaryBounce =
        Math.sin(t * Math.PI * 4) * 0.15 * (1 - bodyFactor);
      const lateralShift = Math.sin(t * Math.PI * 2) * (1 - bodyFactor) * 0.8;
      const momentumShift =
        Math.sin(t * Math.PI * 2 + Math.PI / 4) * 0.2 * (1 - bodyFactor);
      const breathingMotion =
        Math.sin(t * Math.PI * 3) * 0.1 * (1 - bodyFactor);

      pixel.y += primaryBounce + secondaryBounce + breathingMotion;
      pixel.x += lateralShift + momentumShift;

      const dynamicLean = Math.sin(t * Math.PI * 2) * 0.2;
      pixel.x += dynamicLean * (1 - bodyFactor);

      if (pixel.z === undefined) pixel.z = 0;
      pixel.z +=
        (Math.sin(t * Math.PI * 2) * 0.2 + horizontalFactor * 0.1) *
        (1 - bodyFactor);
    }
  }
}
