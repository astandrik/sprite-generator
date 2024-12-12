import {
  CharacterType,
  CharacterConfig,
  DetailedColors,
  CharacterProportions,
  COLOR_PALETTES,
} from "../types/character";

export class CharacterGenerator {
  // Golden ratio ≈ 1.618
  private static readonly GOLDEN_RATIO = 1.618;

  // Enhanced default proportions using golden ratio relationships
  private static readonly DEFAULT_PROPORTIONS: CharacterProportions = {
    headSize: 1.1, // Slightly larger head for better proportions
    bodyWidth: 0.9, // Slim body
    armLength: CharacterGenerator.GOLDEN_RATIO * 1.05, // Slightly longer arms
    legLength: CharacterGenerator.GOLDEN_RATIO * 1.2, // Longer legs for elegance
    shoulderWidth: 1.4, // Wider shoulders for V-shape
    torsoLength: CharacterGenerator.GOLDEN_RATIO * 1.1, // Slightly longer torso
    neckWidth: 0.28, // Slim neck
    waistWidth: 0.65, // Very narrow waist for dramatic taper
    hipWidth: 0.85, // Slim hips
    armWidth: 0.22, // Very thin arms
    legWidth: 0.25, // Slim legs
    muscleDefinition: 0.8, // Enhanced muscle definition
  };

  public generateRandomConfig(
    type?: CharacterType,
    themeName?: string
  ): CharacterConfig {
    const characterType = type || CharacterType.WARRIOR;
    const colors = this.generateColors(characterType, themeName);
    const proportions = this.generateRandomProportions();

    return {
      type: characterType,
      colors,
      proportions,
    };
  }

  private getRandomEnum<T>(enumObj: { [key: string]: string }): T[keyof T] {
    const values = Object.values(enumObj);
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex] as T[keyof T];
  }

  private generateColors(
    type: CharacterType,
    themeName?: string
  ): DetailedColors {
    const palettes = COLOR_PALETTES[type];
    let palette;

    if (themeName) {
      // Find the palette with the specified name
      palette = palettes.find((p) => p.name === themeName);
      if (!palette) {
        // Fallback to first palette if theme not found
        palette = palettes[0];
      }
    } else {
      // Random palette if no theme specified
      palette = palettes[Math.floor(Math.random() * palettes.length)];
    }

    const colors = { ...palette.colors };

    // Enhanced color variation with harmony preservation
    Object.keys(colors).forEach((key) => {
      if (key !== "outline") {
        colors[key as keyof DetailedColors] = this.varyColorHarmoniously(
          colors[key as keyof DetailedColors]
        );
      }
    });

    return colors;
  }

  private varyColorHarmoniously(baseColor: string): string {
    const variation = 12; // Reduced variation for more consistent results
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return baseColor;

    // Apply gaussian-like distribution for more natural variation
    const gaussianRandom = () => {
      const theta = 2 * Math.PI * Math.random();
      const rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
      return (rho * Math.cos(theta) * variation) / 2;
    };

    const varied = {
      r: this.clamp(rgb.r + gaussianRandom(), 0, 255),
      g: this.clamp(rgb.g + gaussianRandom(), 0, 255),
      b: this.clamp(rgb.b + gaussianRandom(), 0, 255),
    };

    return this.rgbToHex(varied.r, varied.g, varied.b);
  }

  private generateRandomProportions(): CharacterProportions {
    const baseProportions = { ...CharacterGenerator.DEFAULT_PROPORTIONS };

    // Enhanced randomization with harmonic relationships
    const harmonicRandomize = (base: number, variation = 0.1): number => {
      // Use gaussian-like distribution for more natural variation
      const theta = 2 * Math.PI * Math.random();
      const rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
      const randomFactor = 1 + rho * Math.cos(theta) * variation;
      return base * randomFactor;
    };

    // Generate proportions while maintaining aesthetic relationships
    const proportions = {
      headSize: harmonicRandomize(baseProportions.headSize, 0.08),
      bodyWidth: harmonicRandomize(baseProportions.bodyWidth, 0.1),
      shoulderWidth: harmonicRandomize(baseProportions.shoulderWidth, 0.12),
      torsoLength: harmonicRandomize(baseProportions.torsoLength, 0.1),
      neckWidth: harmonicRandomize(baseProportions.neckWidth, 0.05),
      waistWidth: harmonicRandomize(baseProportions.waistWidth, 0.08),
      hipWidth: harmonicRandomize(baseProportions.hipWidth, 0.08),
      armWidth: harmonicRandomize(baseProportions.armWidth, 0.06),
      legWidth: harmonicRandomize(baseProportions.legWidth, 0.06),
      muscleDefinition: harmonicRandomize(
        baseProportions.muscleDefinition,
        0.15
      ),
    } as CharacterProportions;

    // Apply golden ratio relationships
    proportions.armLength =
      proportions.torsoLength * CharacterGenerator.GOLDEN_RATIO * 0.8;
    proportions.legLength =
      proportions.torsoLength * CharacterGenerator.GOLDEN_RATIO;

    // Ensure aesthetic constraints
    proportions.waistWidth = Math.min(
      proportions.waistWidth,
      proportions.shoulderWidth * 0.75
    );
    proportions.neckWidth = Math.min(
      proportions.neckWidth,
      proportions.shoulderWidth * 0.3
    );
    proportions.hipWidth = Math.min(
      proportions.hipWidth,
      proportions.shoulderWidth * 0.95
    );

    return proportions;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
