export enum CharacterType {
  WARRIOR = "warrior",
}

export interface DetailedColors {
  primary: string;
  secondary: string;
  outline: string;
}

export interface CharacterProportions {
  headSize: number;
  bodyWidth: number;
  armLength: number;
  legLength: number;
  shoulderWidth: number;
  torsoLength: number;
  neckWidth: number;
  waistWidth: number;
  hipWidth: number;
  armWidth: number;
  legWidth: number;
  muscleDefinition: number;
}

export interface CharacterConfig {
  type: CharacterType;
  colors: DetailedColors;
  proportions: CharacterProportions;
}

export interface ColorPalette {
  name: string;
  colors: DetailedColors;
}

export const COLOR_PALETTES: Record<CharacterType, ColorPalette[]> = {
  [CharacterType.WARRIOR]: [
    {
      name: "Knight",
      colors: {
        primary: "#6D7B8D",
        secondary: "#4A5664",
        outline: "#2F3640",
      },
    },
  ],
};
