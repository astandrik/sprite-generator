import { AnimationState, Frame, SpriteConfig } from "../types";
import { IdleAnimationHandler } from "./animations/IdleAnimationHandler";
import { WalkAnimationHandler } from "./animations/WalkAnimationHandler";
import { AttackAnimationHandler } from "./animations/AttackAnimationHandler";

export class AnimationFrameGenerator {
  private idleHandler: IdleAnimationHandler;
  private walkHandler: WalkAnimationHandler;
  private attackHandler: AttackAnimationHandler;

  constructor(private config: SpriteConfig) {
    const handlerConfig = {
      width: config.width,
      height: config.height,
    };

    this.idleHandler = new IdleAnimationHandler(handlerConfig);
    this.walkHandler = new WalkAnimationHandler(handlerConfig);
    this.attackHandler = new AttackAnimationHandler(handlerConfig);
  }

  public generateAnimationFrame(
    baseFrame: Frame,
    state: AnimationState,
    frameIndex: number
  ): Frame {
    // Create deep copy of pixels
    const newPixels = baseFrame.pixels.map((p) => ({ ...p }));
    const animConfig = this.config.animations.find(
      (a) => a.state === state
    )?.config;

    if (!animConfig) return baseFrame;

    // Calculate normalized time (0 to 1) for the current frame
    const totalFrames =
      this.config.animations.find((a) => a.state === state)?.frames ?? 1;
    const t = frameIndex / (totalFrames - 1);

    switch (state) {
      case AnimationState.IDLE:
        this.idleHandler.applyAnimation(
          newPixels,
          t,
          animConfig.breathingIntensity
        );
        break;

      case AnimationState.WALK:
        this.walkHandler.applyAnimation(newPixels, t, animConfig.walkingSpeed);
        break;

      case AnimationState.ATTACK:
        this.attackHandler.applyAnimation(newPixels, t, animConfig.attackRange);
        break;
    }

    return {
      id: `${state}-${frameIndex}`,
      pixels: newPixels,
      state,
      index: frameIndex,
    };
  }
}
