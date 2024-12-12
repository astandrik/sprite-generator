import { Frame } from "../../types";

export interface AnimationHandlerConfig {
  width: number;
  height: number;
}

export abstract class BaseAnimationHandler {
  constructor(protected config: AnimationHandlerConfig) {}

  abstract applyAnimation(
    pixels: Frame["pixels"],
    t: number,
    intensity?: number
  ): void;
}
