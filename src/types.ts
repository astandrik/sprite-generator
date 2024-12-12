export enum AnimationState {
  IDLE = "idle",
  WALK = "walk",
  ATTACK = "attack",
}

export interface PixelData {
  x: number;
  y: number;
  z?: number; // Optional z-coordinate for depth
  color: string;
}

export interface Frame {
  id: string;
  pixels: PixelData[];
  state: AnimationState;
  index: number;
}

export interface AnimationConfig {
  state: AnimationState;
  frames: number;
  frameDelay: number; // milliseconds between frames
  config: {
    breathingIntensity?: number; // For idle animation
    walkingSpeed?: number; // For walk animation
    attackRange?: number; // For attack animation
    colors?: {
      body?: string;
      outline?: string;
      weapon?: string;
    };
  };
}

export interface SpriteConfig {
  width: number;
  height: number;
  scale: number;
  animations: AnimationConfig[];
}

import { CharacterConfig } from "./types/character";

export interface CharacterSprite {
  frames: Frame[];
  width: number;
  height: number;
  config: SpriteConfig;
  characterConfig: CharacterConfig;
}
