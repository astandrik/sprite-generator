import {
  CharacterType,
  CharacterConfig,
  DetailedColors,
  CharacterProportions,
  COLOR_PALETTES,
} from "../types/character";

export class CharacterGenerator {
  private static readonly DEFAULT_PROPORTIONS: CharacterProportions = {
    headSize: 1,
    bodyWidth: 1,
    armLength: 1,
    legLength: 1,
    shoulderWidth: 1,
    torsoLength: 1.2,
    neckWidth: 0.4,
    waistWidth: 0.8,
    hipWidth: 1.1,
    armWidth: 0.3,
    legWidth: 0.4,
    muscleDefinition: 0.7,
  };

  public generateRandomConfig(type?: CharacterType): CharacterConfig {
    const characterType = type || CharacterType.WARRIOR;
    const colors = this.generateRandomColors(characterType);
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

  private generateRandomColors(type: CharacterType): DetailedColors {
    const palettes = COLOR_PALETTES[type];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const colors = { ...palette.colors };

    // Add slight variations to all colors except outline
    Object.keys(colors).forEach((key) => {
      if (key !== "outline") {
        colors[key as keyof DetailedColors] = this.varyColor(
          colors[key as keyof DetailedColors]
        );
      }
    });

    return colors;
  }

  private varyColor(baseColor: string): string {
    const variation = 15; // Maximum color variation
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return baseColor;

    const varied = {
      r: this.clamp(
        rgb.r + Math.floor(Math.random() * variation * 2) - variation,
        0,
        255
      ),
      g: this.clamp(
        rgb.g + Math.floor(Math.random() * variation * 2) - variation,
        0,
        255
      ),
      b: this.clamp(
        rgb.b + Math.floor(Math.random() * variation * 2) - variation,
        0,
        255
      ),
    };

    return this.rgbToHex(varied.r, varied.g, varied.b);
  }

  private generateRandomProportions(): CharacterProportions {
    const baseProportions = { ...CharacterGenerator.DEFAULT_PROPORTIONS };

    // Add random variations
    const randomize = (base: number, variation = 0.1) => {
      return base * (1 + (Math.random() * variation * 2 - variation));
    };

    return {
      headSize: randomize(baseProportions.headSize),
      bodyWidth: randomize(baseProportions.bodyWidth),
      armLength: randomize(baseProportions.armLength),
      legLength: randomize(baseProportions.legLength),
      shoulderWidth: randomize(baseProportions.shoulderWidth),
      torsoLength: randomize(baseProportions.torsoLength),
      neckWidth: randomize(baseProportions.neckWidth, 0.05), // Less variation for neck
      waistWidth: randomize(baseProportions.waistWidth),
      hipWidth: randomize(baseProportions.hipWidth),
      armWidth: randomize(baseProportions.armWidth, 0.08), // Subtle arm width variation
      legWidth: randomize(baseProportions.legWidth, 0.08), // Subtle leg width variation
      muscleDefinition: randomize(baseProportions.muscleDefinition, 0.15), // More variation for muscle definition
    };
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
