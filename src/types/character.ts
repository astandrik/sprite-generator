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
    {
      name: "Golden",
      colors: {
        primary: "#FFD700",
        secondary: "#DAA520",
        outline: "#8B4513",
      },
    },
    {
      name: "Shadow",
      colors: {
        primary: "#2C3E50",
        secondary: "#34495E",
        outline: "#1B2631",
      },
    },
    {
      name: "Ruby",
      colors: {
        primary: "#E74C3C",
        secondary: "#C0392B",
        outline: "#922B21",
      },
    },
    {
      name: "Forest",
      colors: {
        primary: "#27AE60",
        secondary: "#229954",
        outline: "#196F3D",
      },
    },
    {
      name: "Royal",
      colors: {
        primary: "#3498DB",
        secondary: "#2980B9",
        outline: "#1B4F72",
      },
    },
    {
      name: "Mystic",
      colors: {
        primary: "#9B59B6",
        secondary: "#8E44AD",
        outline: "#633974",
      },
    },
  ],
};
