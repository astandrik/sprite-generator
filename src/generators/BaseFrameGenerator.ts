import { AnimationState, Frame, PixelData, SpriteConfig } from "../types";

export class BaseFrameGenerator {
  constructor(private config: SpriteConfig) {}

  public generateBaseFrame(state: AnimationState, frameIndex: number): Frame {
    const pixels: PixelData[] = [];
    const centerX = Math.floor(this.config.width / 2);
    const centerY = Math.floor(this.config.height / 2);
    const defaultColors = {
      body: "#000000",
      outline: "#444444",
      weapon: "#666666",
    };

    const animationColors = this.config.animations.find(
      (a) => a.state === state
    )?.config.colors;
    const colors = {
      body: animationColors?.body ?? defaultColors.body,
      outline: animationColors?.outline ?? defaultColors.outline,
      weapon: animationColors?.weapon ?? defaultColors.weapon,
    };

    // Helper function to add pixel with outline
    const addPixelWithOutline = (
      x: number,
      y: number,
      isBody: boolean = true
    ) => {
      // Add main pixel
      pixels.push({ x, y, color: isBody ? colors.body : colors.weapon });

      // Add outline pixels
      const outlinePositions = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];

      outlinePositions.forEach(([ox, oy]) => {
        if (!pixels.some((p) => p.x === ox && p.y === oy)) {
          pixels.push({ x: ox, y: oy, color: colors.outline });
        }
      });
    };

    // Head with outline
    for (let y = centerY - 8; y < centerY - 4; y++) {
      for (let x = centerX - 2; x < centerX + 2; x++) {
        addPixelWithOutline(x, y);
      }
    }

    // Body with outline
    for (let y = centerY - 4; y < centerY + 4; y++) {
      for (let x = centerX - 3; x < centerX + 3; x++) {
        addPixelWithOutline(x, y);
      }
    }

    // Arms with outline
    for (let y = centerY - 3; y < centerY + 1; y++) {
      addPixelWithOutline(centerX - 4, y);
      addPixelWithOutline(centerX + 4, y);
    }

    // Legs with outline
    for (let y = centerY + 4; y < centerY + 8; y++) {
      addPixelWithOutline(centerX - 2, y);
      addPixelWithOutline(centerX + 2, y);
    }

    // Add weapon for attack state
    if (state === AnimationState.ATTACK) {
      for (let y = centerY - 2; y < centerY + 2; y++) {
        addPixelWithOutline(centerX + 5, y, false);
      }
    }

    return {
      id: `${state}-${frameIndex}`,
      pixels,
      state,
      index: frameIndex,
    };
  }
}
