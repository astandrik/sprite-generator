import { Frame } from "../../types";
import { EasingUtils } from "../EasingUtils";
import { BaseAnimationHandler } from "./BaseAnimationHandler";

// Animation constants for better maintainability
const ANIMATION_CONSTANTS = {
  FORWARD_LEAN: 0.25, // Reduced forward lean for more upright posture
  VERTICAL_BOUNCE_FACTOR: 0.15, // Reduced bounce for smoother movement
  TORSO_HEIGHT: {
    MIN: 0.3,
    MAX: 0.7,
  },
  ARM_BOUNDS: {
    X_MIN: 0.3,
    X_MAX: 0.7,
  },
  MOVEMENT_INTENSITY: {
    PRIMARY: 0.8, // Reduced primary movement intensity
    SECONDARY: 0.15, // Reduced secondary movement
    MICRO: 0.05, // Reduced micro movements
  },
};

export class WalkAnimationHandler extends BaseAnimationHandler {
  // Initialize and get z-coordinate for a pixel
  private getZCoordinate(pixel: Frame["pixels"][0]): number {
    if (pixel.z === undefined) {
      pixel.z = 0;
    }
    return pixel.z;
  }

  // Update z-coordinate with a new value
  private updateZCoordinate(pixel: Frame["pixels"][0], delta: number): void {
    pixel.z = this.getZCoordinate(pixel) + delta;
  }
  public applyAnimation(
    pixels: Frame["pixels"],
    t: number,
    speed: number = 3
  ): void {
    const walkCycle = EasingUtils.walkCycle(t);
    const walkOffset = walkCycle * speed;
    const hipSway = EasingUtils.hipSway(t);
    const torsoRotation = EasingUtils.torsoRotation(t);

    // Enhanced weight distribution with improved biomechanics
    const weightShift = Math.sin(t * Math.PI * 2 - Math.PI / 6) * 0.6;
    const forwardLean = 0.4; // Reduced forward lean for better posture

    // Improved vertical movement with natural bounce
    const verticalBounce = Math.abs(Math.sin(t * Math.PI * 2)) * 0.3;

    pixels.forEach((pixel) => {
      const isLeftSide = pixel.x < this.config.width / 2;
      const relativeHeight = pixel.y / this.config.height;
      const distanceFromCenter =
        Math.abs(pixel.x - this.config.width / 2) / (this.config.width / 2);

      // Apply movements in a specific order for better coordination
      this.applyBodyMovement(pixel, t, relativeHeight, forwardLean);
      this.applyTorsoMovement(pixel, t, torsoRotation, distanceFromCenter);
      this.applyLegMovement(pixel, t, isLeftSide, speed, hipSway);
      this.applyArmMovement(pixel, t, isLeftSide, speed, torsoRotation);
      this.applyTorsoAnimation(pixel, t, verticalBounce);
    });
  }

  private applyBodyMovement(
    pixel: Frame["pixels"][0],
    t: number,
    relativeHeight: number,
    forwardLean: number = ANIMATION_CONSTANTS.FORWARD_LEAN
  ): void {
    if (pixel.y < this.config.height * 0.9) {
      // Enhanced natural lean with height-based influence
      const leanFactor = Math.pow(1 - relativeHeight, 1.4);
      const dynamicLean =
        forwardLean *
        (1 +
          Math.sin(t * Math.PI * 2) *
            ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.SECONDARY);

      // Add subtle lateral movement
      const lateralMovement =
        Math.sin(t * Math.PI * 4) *
        ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.MICRO *
        (1 - relativeHeight);

      pixel.x += dynamicLean * leanFactor + lateralMovement;

      // Add subtle forward/backward motion
      this.updateZCoordinate(
        pixel,
        Math.sin(t * Math.PI * 2) *
          ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.MICRO *
          (1 - relativeHeight)
      );
    }
  }

  private applyTorsoMovement(
    pixel: Frame["pixels"][0],
    t: number,
    torsoRotation: number,
    distanceFromCenter: number
  ): void {
    if (
      pixel.y < this.config.height * ANIMATION_CONSTANTS.TORSO_HEIGHT.MAX &&
      pixel.y > this.config.height * ANIMATION_CONSTANTS.TORSO_HEIGHT.MIN
    ) {
      const torsoFactor =
        (pixel.y - this.config.height * 0.3) / (this.config.height * 0.4);

      // Enhanced rotation with natural resistance
      const rotationAmount =
        torsoRotation * (1 - Math.pow(torsoFactor, 1.2)) * distanceFromCenter;

      // Add subtle compression/expansion
      const breathingEffect =
        Math.sin(t * Math.PI * 3) * 0.1 * (1 - torsoFactor);

      pixel.x += rotationAmount * 1.8;
      pixel.y += Math.abs(rotationAmount) * 0.4 + breathingEffect;
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

      // Enhanced multi-phase leg movement
      const stridePhase = legPhase * Math.PI * 2;
      const liftPhase = ((legPhase + 0.25) % 1) * Math.PI * 2;
      const groundContactPhase = ((legPhase + 0.75) % 1) * Math.PI * 2;

      // Improved natural leg motion
      const legSwing =
        EasingUtils.easeInOutSine(legPhase) * speed * 1.1 + // Primary stride
        Math.sin(stridePhase * 2) * 0.25 + // Secondary motion
        Math.sin(liftPhase) * 0.15; // Tertiary adjustment

      this.applyLegDynamics(
        pixel,
        legSwing,
        legPhase,
        legFactor,
        speed,
        isLeftSide,
        stridePhase,
        groundContactPhase
      );

      // Enhanced hip influence
      pixel.x +=
        hipSway * (1 - Math.pow(legFactor, 1.3)) * (isLeftSide ? 1 : -1);
    }
  }

  private applyLegDynamics(
    pixel: Frame["pixels"][0],
    legSwing: number,
    legPhase: number,
    legFactor: number,
    speed: number,
    isLeftSide: boolean,
    stridePhase: number,
    groundContactPhase: number
  ): void {
    // Refined knee mechanics for more elegant movement
    const kneeBend = Math.sin(legPhase * Math.PI) * 1.4; // Reduced knee bend
    const kneeRotation = Math.cos(legPhase * Math.PI * 2) * 0.15; // Subtler rotation

    // Smoother ground contact
    const groundContact = Math.max(0, Math.sin(groundContactPhase)) * 0.8;

    if (isLeftSide) {
      const strideForward = legSwing > 0;
      const bendIntensity =
        Math.abs(legSwing / speed) * (strideForward ? 0.9 : 0.7); // Reduced intensity

      // Smoother leg movement
      pixel.x += legSwing * legFactor * 0.9; // Slightly reduced stride

      if (!strideForward) {
        // More graceful lifting phase
        const liftCurve = EasingUtils.easeInOutSine(
          1 - Math.pow(legFactor, 1.3)
        );
        pixel.y -= bendIntensity * kneeBend * liftCurve;
        pixel.x += (bendIntensity * kneeRotation + 0.15) * legFactor;
        pixel.x += bendIntensity * 0.1 * legFactor;
      } else {
        // Gentler landing phase
        const landingFactor =
          Math.max(0, Math.sin(stridePhase + Math.PI / 4)) * 0.8;
        pixel.y += landingFactor * 0.15 * legFactor;
        pixel.y += groundContact * 0.08 * legFactor;
      }
    } else {
      const strideForward = legSwing < 0;
      const bendIntensity =
        Math.abs(legSwing / speed) * (strideForward ? 1.1 : 0.9);

      pixel.x -= legSwing * legFactor;

      if (!strideForward) {
        // Enhanced lifting phase
        pixel.y -= bendIntensity * kneeBend * (1 - Math.pow(legFactor, 1.2));
        pixel.x -= (bendIntensity * kneeRotation + 0.25) * legFactor;
        pixel.x -= bendIntensity * 0.15 * legFactor;
      } else {
        // Enhanced landing phase
        const landingFactor = Math.max(0, Math.sin(stridePhase + Math.PI / 4));
        pixel.y += landingFactor * 0.25 * legFactor;
        pixel.y += groundContact * 0.1 * legFactor;
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
      (pixel.x < this.config.width * ANIMATION_CONSTANTS.ARM_BOUNDS.X_MIN ||
        pixel.x > this.config.width * ANIMATION_CONSTANTS.ARM_BOUNDS.X_MAX)
    ) {
      const armFactor =
        Math.abs(this.config.width / 2 - pixel.x) / (this.config.width / 2);
      const armPhase = isLeftSide ? (t + 0.5) % 1 : t;

      // Refined arm motion for elegance
      const primarySwing = EasingUtils.easeInOutSine(armPhase) * (speed * 0.5); // Reduced primary swing
      const secondarySwing = Math.sin(armPhase * Math.PI * 2) * 0.15; // Smoother secondary motion
      const microAdjustment = Math.sin(armPhase * Math.PI * 4) * 0.04; // Subtler micro-movements

      // Blend movements with easing for smoother transition
      const armSwing =
        primarySwing * 0.8 +
        secondarySwing * EasingUtils.easeInOutSine(armPhase) +
        microAdjustment;

      this.applyArmDynamics(
        pixel,
        armSwing,
        armPhase,
        armFactor,
        speed,
        isLeftSide,
        torsoRotation * 0.8 // Reduced torso influence
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
    // Refined shoulder mechanics for elegance
    const shoulderRotation = Math.sin(armPhase * Math.PI * 2) * 0.25; // Reduced rotation
    const shoulderLift = Math.cos(armPhase * Math.PI * 2) * 0.15; // Subtler lift

    // Smoother elbow mechanics
    const elbowPhase = (armPhase + 0.25) % 1;
    const baseBend = Math.sin(elbowPhase * Math.PI * 2 + Math.PI);
    // More natural elbow bend with easing
    const elbowBend =
      baseBend *
      0.25 *
      EasingUtils.easeInOutSine(1 - Math.abs(armSwing) / speed);

    // Refined arm twist for fluidity
    const armTwist = Math.sin(armPhase * Math.PI * 2) * 0.08;

    if (isLeftSide) {
      pixel.x -= armSwing * armFactor;
      pixel.y += (shoulderRotation + shoulderLift) * armFactor;

      if (pixel.y > this.config.height * 0.3) {
        const elbowFactor =
          (pixel.y - this.config.height * 0.3) / (this.config.height * 0.2);
        pixel.x += elbowBend * armFactor * elbowFactor;
        pixel.x += armTwist * armFactor * (1 - elbowFactor);
      }

      this.updateZCoordinate(
        pixel,
        (armSwing * 0.25 + elbowBend * 0.15) * armFactor
      );
    } else {
      pixel.x += armSwing * armFactor;
      pixel.y += (shoulderRotation + shoulderLift) * armFactor;

      if (pixel.y > this.config.height * 0.3) {
        const elbowFactor =
          (pixel.y - this.config.height * 0.3) / (this.config.height * 0.2);
        pixel.x -= elbowBend * armFactor * elbowFactor;
        pixel.x -= armTwist * armFactor * (1 - elbowFactor);
      }

      this.updateZCoordinate(
        pixel,
        (-armSwing * 0.25 - elbowBend * 0.15) * armFactor
      );
    }

    // Enhanced torso influence
    pixel.x += torsoRotation * armFactor * 1.2;
    pixel.y += Math.abs(torsoRotation) * armFactor * 0.4;
  }

  private applyTorsoAnimation(
    pixel: Frame["pixels"][0],
    t: number,
    verticalBounce: number
  ): void {
    if (
      pixel.y >= this.config.height * 0.5 &&
      pixel.y <= this.config.height * ANIMATION_CONSTANTS.TORSO_HEIGHT.MAX
    ) {
      const bodyFactor =
        (pixel.y - this.config.height * 0.5) /
        (this.config.height * (ANIMATION_CONSTANTS.TORSO_HEIGHT.MAX - 0.5));
      const horizontalFactor =
        (pixel.x - this.config.width / 2) / (this.config.width / 2);

      // Refined natural body motion for elegance
      const primaryBounce =
        verticalBounce * (1 - Math.pow(bodyFactor, 1.4)) * 0.4; // Reduced bounce
      const secondaryBounce =
        Math.sin(t * Math.PI * 3) * // Smoother frequency
        ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.MICRO *
        0.8 * // Reduced intensity
        (1 - bodyFactor);
      const lateralShift =
        Math.sin(t * Math.PI * 2) *
        (1 - bodyFactor) *
        ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.PRIMARY *
        0.4; // More subtle shift
      const momentumShift =
        Math.sin(t * Math.PI * 2 + Math.PI / 6) * // Adjusted phase
        ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.SECONDARY *
        0.7 * // Reduced intensity
        (1 - bodyFactor);
      const breathingMotion =
        Math.sin(t * Math.PI * 2.5) * // Slower breathing
        ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.MICRO *
        0.8 * // Subtler breathing
        (1 - bodyFactor);

      // Apply movements with easing for smoother transitions
      const easedBodyFactor = EasingUtils.easeInOutSine(1 - bodyFactor);
      pixel.y +=
        (primaryBounce + secondaryBounce) * easedBodyFactor + breathingMotion;
      pixel.x += (lateralShift + momentumShift) * easedBodyFactor;

      // Refined dynamic lean
      const dynamicLean = Math.sin(t * Math.PI * 2) * 0.08; // Reduced lean
      pixel.x += dynamicLean * easedBodyFactor;

      // Enhanced depth movement
      this.updateZCoordinate(
        pixel,
        (Math.sin(t * Math.PI * 2) *
          ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.SECONDARY +
          horizontalFactor * ANIMATION_CONSTANTS.MOVEMENT_INTENSITY.MICRO) *
          (1 - bodyFactor)
      );
    }
  }
}
