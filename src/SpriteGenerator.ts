import { AnimationState, SpriteConfig, CharacterSprite, Frame } from "./types";
import { BaseFrameGenerator } from "./generators/BaseFrameGenerator";
import { AnimationFrameGenerator } from "./generators/AnimationFrameGenerator";
import { FrameRenderer } from "./generators/FrameRenderer";
import { PixelManipulator } from "./generators/PixelManipulator";

export class SpriteGenerator {
  private baseFrameGenerator: BaseFrameGenerator;
  private animationFrameGenerator: AnimationFrameGenerator;
  private frameRenderer: FrameRenderer;
  private pixelManipulator: PixelManipulator;

  constructor(private _config: SpriteConfig) {
    this.baseFrameGenerator = new BaseFrameGenerator(_config);
    this.animationFrameGenerator = new AnimationFrameGenerator(_config);
    this.frameRenderer = new FrameRenderer(_config);
    this.pixelManipulator = new PixelManipulator(_config);
  }

  public get config(): SpriteConfig {
    return this._config;
  }

  public generateSprite(): CharacterSprite {
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
