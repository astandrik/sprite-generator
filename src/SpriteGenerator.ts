import { AnimationState, SpriteConfig, CharacterSprite, Frame } from "./types";
import { BaseFrameGenerator } from "./generators/BaseFrameGenerator";
import { AnimationFrameGenerator } from "./generators/AnimationFrameGenerator";
import { FrameRenderer } from "./generators/FrameRenderer";
import { PixelManipulator } from "./generators/PixelManipulator";

import { CharacterGenerator } from "./generators/CharacterGenerator";
import { CharacterConfig, CharacterType } from "./types/character";

export class SpriteGenerator {
  private baseFrameGenerator: BaseFrameGenerator;
  private animationFrameGenerator: AnimationFrameGenerator;
  private frameRenderer: FrameRenderer;
  private pixelManipulator: PixelManipulator;
  private characterGenerator: CharacterGenerator;
  private currentCharacterConfig: CharacterConfig;

  constructor(private _config: SpriteConfig) {
    this.characterGenerator = new CharacterGenerator();
    this.currentCharacterConfig =
      this.characterGenerator.generateRandomConfig();
    this.baseFrameGenerator = new BaseFrameGenerator(
      _config,
      this.currentCharacterConfig
    );
    this.animationFrameGenerator = new AnimationFrameGenerator(_config);
    this.frameRenderer = new FrameRenderer(_config);
    this.pixelManipulator = new PixelManipulator(_config);
  }

  public get config(): SpriteConfig {
    return this._config;
  }

  public generateSprite(type?: CharacterType): CharacterSprite {
    // Generate character configuration with optional type
    this.currentCharacterConfig =
      this.characterGenerator.generateRandomConfig(type);
    this.baseFrameGenerator = new BaseFrameGenerator(
      this._config,
      this.currentCharacterConfig
    );

    const frames: Frame[] = [];

    this._config.animations.forEach((animation) => {
      const baseFrame = this.baseFrameGenerator.generateBaseFrame(
        animation.state,
        0
      );

      for (let i = 0; i < animation.frames; i++) {
        frames.push(
          this.animationFrameGenerator.generateAnimationFrame(
            baseFrame,
            animation.state,
            i
          )
        );
      }
    });

    return {
      frames,
      width: this._config.width,
      height: this._config.height,
      config: this._config,
      characterConfig: this.currentCharacterConfig, // Include character config in sprite data
    };
  }

  public getCurrentCharacterConfig(): CharacterConfig {
    return this.currentCharacterConfig;
  }

  public regenerateCharacter(): CharacterSprite {
    return this.generateSprite();
  }

  public generateCharacterWithConfig(
    characterConfig: CharacterConfig
  ): CharacterSprite {
    this.currentCharacterConfig = characterConfig;
    this.baseFrameGenerator = new BaseFrameGenerator(
      this._config,
      characterConfig
    );

    const frames: Frame[] = [];

    this._config.animations.forEach((animation) => {
      const baseFrame = this.baseFrameGenerator.generateBaseFrame(
        animation.state,
        0
      );

      for (let i = 0; i < animation.frames; i++) {
        frames.push(
          this.animationFrameGenerator.generateAnimationFrame(
            baseFrame,
            animation.state,
            i
          )
        );
      }
    });

    return {
      frames,
      width: this._config.width,
      height: this._config.height,
      config: this._config,
      characterConfig: characterConfig,
    };
  }

  public renderFrame(frame: Frame): ImageData {
    return this.frameRenderer.renderFrame(frame);
  }

  public updateFramePixel(
    frame: Frame,
    x: number,
    y: number,
    color: string
  ): Frame {
    return this.pixelManipulator.updateFramePixel(frame, x, y, color);
  }

  public removeFramePixel(frame: Frame, x: number, y: number): Frame {
    return this.pixelManipulator.removeFramePixel(frame, x, y);
  }
}
