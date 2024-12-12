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
    const headHeight = Math.round(6 * props.headSize);
    const bodyWidth = Math.round(5 * props.bodyWidth);
    const armLength = Math.round(8 * props.armLength);
    const legLength = Math.round(10 * props.legLength);
    const torsoLength = Math.round(8 * props.torsoLength);
    const neckWidth = Math.round(3 * props.neckWidth);
    const waistWidth = Math.round(4 * props.waistWidth);
    const hipWidth = Math.round(5 * props.hipWidth);
    const armWidth = Math.round(3 * props.armWidth);
    const legWidth = Math.round(3 * props.legWidth);
    const muscleShade = 0.9 + props.muscleDefinition * 0.2; // More definition = more contrast

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

    // Enhanced torso with muscle definition
    const torsoStart = centerY - torsoLength / 2;
    const torsoEnd = centerY + torsoLength / 2;

    for (let y = torsoStart; y < torsoEnd; y++) {
      // Calculate dynamic width for hourglass shape
      const progress = (y - torsoStart) / (torsoEnd - torsoStart);
      const currentWidth = Math.round(
        bodyWidth * (1 - progress) + waistWidth * progress
      );

      // Add muscle definition through shading
      const musclePattern =
        Math.sin((y - torsoStart) * 0.5) * props.muscleDefinition * 0.1;

      for (let x = centerX - currentWidth; x <= centerX + currentWidth; x++) {
        const distFromCenter = Math.abs(x - centerX) / currentWidth;
        const shade = muscleShade + musclePattern + distFromCenter * 0.1;

        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: shade,
        });
      }
    }

    // Enhanced arms with muscle definition
    const armOffset = bodyWidth + 1;
    for (let y = centerY - 3; y < centerY - 3 + armLength; y++) {
      const armProgress = (y - (centerY - 3)) / armLength;
      const currentArmWidth = Math.round(armWidth * (1 - armProgress * 0.3));

      // Left arm
      for (
        let x = centerX - armOffset - currentArmWidth;
        x <= centerX - armOffset + currentArmWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - centerY) * 0.8) * props.muscleDefinition * 0.15;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail,
        });
      }

      // Right arm
      for (
        let x = centerX + armOffset - currentArmWidth;
        x <= centerX + armOffset + currentArmWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - centerY) * 0.8) * props.muscleDefinition * 0.15;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail,
        });
      }
    }

    // Enhanced legs with muscle definition
    const hipY = torsoEnd;
    const legSpread = hipWidth / 2;

    // Hip area
    for (let y = hipY; y < hipY + 3; y++) {
      for (let x = centerX - hipWidth; x <= centerX + hipWidth; x++) {
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade * 0.95,
        });
      }
    }

    // Legs with varying width and muscle definition
    for (let y = hipY + 3; y < hipY + 3 + legLength; y++) {
      const legProgress = (y - (hipY + 3)) / legLength;
      const currentLegWidth = Math.round(legWidth * (1 - legProgress * 0.2));

      // Left leg
      for (
        let x = centerX - legSpread - currentLegWidth;
        x <= centerX - legSpread + currentLegWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - hipY) * 0.5) * props.muscleDefinition * 0.15;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail,
        });
      }

      // Right leg
      for (
        let x = centerX + legSpread - currentLegWidth;
        x <= centerX + legSpread + currentLegWidth;
        x++
      ) {
        const muscleDetail =
          Math.sin((y - hipY) * 0.5) * props.muscleDefinition * 0.15;
        addPixelWithEffects(x, y, "body", {
          antiAlias: true,
          shade: muscleShade + muscleDetail,
        });
      }
    }

    // Enhanced weapon rendering for attack state
    if (state === AnimationState.ATTACK) {
      const weaponOffset = armOffset + 2;
      const bladeLength = 8;
      const bladeWidth = 2;

      // Enhanced blade with gradient and edge highlight
      for (let y = centerY - bladeLength; y < centerY + 1; y++) {
        const bladeProgress = (y - (centerY - bladeLength)) / bladeLength;
        const currentBladeWidth = Math.max(
          1,
          Math.round(bladeWidth * (1 - bladeProgress * 0.5))
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
