import { AnimationState, Frame, SpriteConfig } from "../types";
import { CharacterConfig, CharacterType } from "../types/character";
import { PixelManipulator } from "./PixelManipulator";

export class BaseFrameGenerator {
  private pixelManipulator: PixelManipulator;

  constructor(
    private config: SpriteConfig,
    private characterConfig: CharacterConfig
  ) {
    this.pixelManipulator = new PixelManipulator(config);
  }

  public generateBaseFrame(state: AnimationState, frameIndex: number): Frame {
    let frame: Frame = {
      id: `${state}-${frameIndex}`,
      pixels: [],
      state,
      index: frameIndex,
    };

    const centerX = Math.floor(this.config.width / 2);
    const centerY = Math.floor(this.config.height / 2);

    const colors = {
      body: this.characterConfig.colors.primary,
      outline: this.characterConfig.colors.outline,
      secondary: this.characterConfig.colors.secondary,
    };

    // Helper function to add pixel with effects
    const addPixelWithEffects = (
      x: number,
      y: number,
      colorType: keyof typeof colors = "body",
      effects?: {
        shade?: number;
        antiAlias?: boolean;
      }
    ) => {
      frame = this.pixelManipulator.updateFramePixel(
        frame,
        x,
        y,
        colors[colorType],
        effects
      );
    };

    // Apply enhanced character proportions
    const props = this.characterConfig.proportions;
    const headHeight = Math.round(5 * props.headSize);
    const bodyWidth = Math.round(4 * props.bodyWidth);
    const armLength = Math.round(8 * props.armLength);
    const legLength = Math.round(10 * props.legLength);
    const torsoLength = Math.round(8 * props.torsoLength);
    const neckWidth = Math.round(2 * props.neckWidth);
    const waistWidth = Math.round(3 * props.waistWidth);
    const hipWidth = Math.round(4 * props.hipWidth);
    const armWidth = Math.round(2 * props.armWidth);
    const legWidth = Math.round(2 * props.legWidth);
    const muscleShade = 0.95 + props.muscleDefinition * 0.1; // Subtler muscle definition

    // Enhanced head with better shape and details
    const headStart = centerY - headHeight;
    const headWidth = Math.round(4 * props.headSize);

    // Head shape with varying width
    for (let y = headStart; y < headStart + headHeight; y++) {
      const headProgress = (y - headStart) / headHeight;
      let currentHeadWidth;

      if (headProgress < 0.3) {
        // Top of head - rounded
        currentHeadWidth = Math.round(headWidth * (headProgress * 3));
      } else if (headProgress > 0.8) {
        // Chin area - tapered
        currentHeadWidth = Math.round(
          headWidth * (1 - (headProgress - 0.8) * 2)
        );
      } else {
        // Middle of head
        currentHeadWidth = headWidth;
      }

      for (
        let x = centerX - currentHeadWidth;
        x <= centerX + currentHeadWidth;
        x++
      ) {
        const distFromCenter = Math.abs(x - centerX) / currentHeadWidth;
        const shade = 1 - distFromCenter * 0.1; // Subtle shading for roundness

        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: shade,
        });
      }
    }

    // Enhanced facial features
    const eyeY = headStart + Math.round(headHeight * 0.4);
    const eyeSpacing = Math.round(headWidth * 0.5);

    // Eyes with more detail
    addPixelWithEffects(centerX - eyeSpacing, eyeY, "outline");
    addPixelWithEffects(centerX + eyeSpacing, eyeY, "outline");
    addPixelWithEffects(centerX - eyeSpacing, eyeY - 1, "outline", {
      shade: 0.7,
    });
    addPixelWithEffects(centerX + eyeSpacing, eyeY - 1, "outline", {
      shade: 0.7,
    });

    // Simple mouth
    const mouthY = headStart + Math.round(headHeight * 0.7);
    addPixelWithEffects(centerX, mouthY, "outline", { shade: 0.8 });

    // Neck
    for (let y = centerY - headHeight + 4; y < centerY - torsoLength / 2; y++) {
      for (let x = centerX - neckWidth; x <= centerX + neckWidth; x++) {
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade * 0.95,
        });
      }
    }

    // Enhanced torso with dynamic tapering
    const torsoStart = centerY - torsoLength / 2;
    const torsoEnd = centerY + torsoLength / 2;
    const shoulderY = torsoStart + Math.round(torsoLength * 0.2); // Shoulder position
    const waistY = torsoEnd - Math.round(torsoLength * 0.2); // Waist position

    for (let y = torsoStart; y < torsoEnd; y++) {
      let currentWidth;
      const progress = (y - torsoStart) / (torsoEnd - torsoStart);

      if (y < shoulderY) {
        // Upper chest area - gradual widening
        const shoulderProgress = (y - torsoStart) / (shoulderY - torsoStart);
        currentWidth = Math.round(
          bodyWidth + (props.shoulderWidth - bodyWidth) * shoulderProgress
        );
      } else if (y > waistY) {
        // Lower torso - slight widening towards hips
        const hipProgress = (y - waistY) / (torsoEnd - waistY);
        currentWidth = Math.round(
          waistWidth + (hipWidth - waistWidth) * hipProgress
        );
      } else {
        // Middle torso - dramatic taper
        const midProgress = (y - shoulderY) / (waistY - shoulderY);
        currentWidth = Math.round(
          props.shoulderWidth +
            (waistWidth - props.shoulderWidth) * Math.pow(midProgress, 1.5)
        );
      }

      // Subtle muscle definition
      const musclePattern =
        Math.sin((y - torsoStart) * 0.3) * props.muscleDefinition * 0.03;

      for (let x = centerX - currentWidth; x <= centerX + currentWidth; x++) {
        const distFromCenter = Math.abs(x - centerX) / currentWidth;
        const shade = muscleShade + musclePattern + distFromCenter * 0.03;

        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: shade,
        });
      }
    }

    // Enhanced arms with elegant curves
    const armOffset = bodyWidth + 1;
    for (let y = centerY - 3; y < centerY - 3 + armLength; y++) {
      const armProgress = (y - (centerY - 3)) / armLength;
      const currentArmWidth = Math.round(armWidth * (1 - armProgress * 0.35));

      // Add subtle curves to arms
      const armCurve = Math.sin(armProgress * Math.PI) * 1.5;

      // Left arm with inward curve
      const leftArmX = centerX - armOffset + armCurve * 0.3;
      for (
        let x = leftArmX - currentArmWidth;
        x <= leftArmX + currentArmWidth;
        x++
      ) {
        const distFromCenter = Math.abs(x - leftArmX) / currentArmWidth;
        const muscleDetail =
          Math.sin((y - centerY) * 0.4) * props.muscleDefinition * 0.05;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail - distFromCenter * 0.03,
        });
      }

      // Right arm with outward curve
      const rightArmX = centerX + armOffset - armCurve * 0.3;
      for (
        let x = rightArmX - currentArmWidth;
        x <= rightArmX + currentArmWidth;
        x++
      ) {
        const distFromCenter = Math.abs(x - rightArmX) / currentArmWidth;
        const muscleDetail =
          Math.sin((y - centerY) * 0.4) * props.muscleDefinition * 0.05;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail - distFromCenter * 0.03,
        });
      }
    }

    // Enhanced legs with dynamic curves
    const hipY = torsoEnd;
    const baseSpread = hipWidth * 0.6;

    // Slimmer hip area
    for (let y = hipY; y < hipY + 2; y++) {
      const hipTaper = (y - hipY) / 2;
      const currentHipWidth = hipWidth * (1 - hipTaper * 0.2);
      for (
        let x = centerX - currentHipWidth;
        x <= centerX + currentHipWidth;
        x++
      ) {
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade * 0.97,
        });
      }
    }

    // Legs with subtle curves and varying width
    for (let y = hipY + 2; y < hipY + 2 + legLength; y++) {
      const legProgress = (y - (hipY + 2)) / legLength;
      const currentLegWidth = Math.round(legWidth * (1 - legProgress * 0.25));

      // Calculate leg positions with subtle S-curve
      const curveOffset = Math.sin(legProgress * Math.PI) * 2;
      const legSpread = baseSpread + curveOffset;

      // Left leg with inward curve
      const leftLegX = centerX - legSpread + curveOffset * 0.5;
      for (
        let x = leftLegX - currentLegWidth;
        x <= leftLegX + currentLegWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - hipY) * 0.4) * props.muscleDefinition * 0.08;
        const distFromCenter = Math.abs(x - leftLegX) / currentLegWidth;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail - distFromCenter * 0.05,
        });
      }

      // Right leg with outward curve
      const rightLegX = centerX + legSpread - curveOffset * 0.5;
      for (
        let x = rightLegX - currentLegWidth;
        x <= rightLegX + currentLegWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - hipY) * 0.4) * props.muscleDefinition * 0.08;
        const distFromCenter = Math.abs(x - rightLegX) / currentLegWidth;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail - distFromCenter * 0.05,
        });
      }
    }

    // Enhanced weapon rendering for attack state
    if (state === AnimationState.ATTACK) {
      const weaponOffset = armOffset + 1;
      const bladeLength = 9;
      const bladeWidth = 1;

      // Enhanced blade with gradient and edge highlight
      for (let y = centerY - bladeLength; y < centerY + 1; y++) {
        const bladeProgress = (y - (centerY - bladeLength)) / bladeLength;
        const currentBladeWidth = Math.max(
          1,
          Math.round(bladeWidth * (1 - bladeProgress * 0.3))
        );

        // Main blade body
        for (
          let x = centerX + weaponOffset - currentBladeWidth;
          x <= centerX + weaponOffset + currentBladeWidth;
          x++
        ) {
          const distFromCenter =
            Math.abs(x - (centerX + weaponOffset)) / currentBladeWidth;
          const shade = 0.95 + distFromCenter * 0.1; // Lighter in the middle

          addPixelWithEffects(x, y, "secondary", {
            antiAlias: true,
            shade: shade,
          });
        }

        // Edge highlight
        addPixelWithEffects(
          centerX + weaponOffset + currentBladeWidth,
          y,
          "secondary",
          {
            antiAlias: true,
            shade: 1.1, // Slightly brighter for edge highlight
          }
        );
      }

      // Enhanced guard with more detail
      const guardWidth = 3;
      for (
        let x = centerX + weaponOffset - guardWidth;
        x <= centerX + weaponOffset + guardWidth;
        x++
      ) {
        // Main guard
        addPixelWithEffects(x, centerY + 1, "secondary", {
          shade: 0.9,
          antiAlias: true,
        });

        // Guard details
        if (x === centerX + weaponOffset) {
          addPixelWithEffects(x, centerY + 2, "secondary", {
            shade: 0.85,
          });
        }
      }

      // Enhanced handle with grip detail
      for (let y = centerY + 2; y <= centerY + 4; y++) {
        // Main handle
        addPixelWithEffects(centerX + weaponOffset, y, "secondary", {
          shade: 0.85,
        });

        // Grip pattern
        if (y % 2 === 0) {
          addPixelWithEffects(centerX + weaponOffset - 1, y, "secondary", {
            shade: 0.8,
            antiAlias: true,
          });
          addPixelWithEffects(centerX + weaponOffset + 1, y, "secondary", {
            shade: 0.8,
            antiAlias: true,
          });
        }
      }

      // Pommel
      addPixelWithEffects(centerX + weaponOffset, centerY + 5, "secondary", {
        shade: 0.9,
        antiAlias: true,
      });
    }

    return frame;
  }
}
