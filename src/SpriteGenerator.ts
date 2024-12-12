import {
  AnimationState,
  SpriteConfig,
  CharacterSprite,
  PixelData,
  Frame,
} from "./types";

export class SpriteGenerator {
  private _config: SpriteConfig;

  public get config(): SpriteConfig {
    return this._config;
  }
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(config: SpriteConfig) {
    this._config = config;
    this.canvas = document.createElement("canvas");
    this.canvas.width = config.width * config.scale;
    this.canvas.height = config.height * config.scale;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    this.ctx = context;
  }

  private generateBaseFrame(state: AnimationState, frameIndex: number): Frame {
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

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  private generateAnimationFrame(
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
      case AnimationState.IDLE: {
        const intensity = animConfig.breathingIntensity ?? 1.5;
        // Use sine wave for smooth breathing
        const breathPhase = this.easeInOutSine(t) * 2 * Math.PI;
        const breathOffset = Math.sin(breathPhase) * intensity;

        newPixels.forEach((pixel) => {
          // Apply breathing effect with smooth falloff based on height
          const heightFactor = Math.max(
            0,
            1 - pixel.y / (this.config.height / 2)
          );
          pixel.y += breathOffset * heightFactor;
        });
        break;
      }

      case AnimationState.WALK: {
        const speed = animConfig.walkingSpeed ?? 3;
        // Use quadratic easing for more natural movement
        const cycle = this.easeInOutQuad(t) * 2 * Math.PI;
        const walkOffset = Math.sin(cycle) * speed;
        const bounceOffset = Math.abs(Math.sin(cycle)) * 2;

        newPixels.forEach((pixel) => {
          const isLeftSide = pixel.x < this.config.width / 2;

          // Legs movement with improved physics
          if (pixel.y > this.config.height * 0.7) {
            const legFactor =
              (pixel.y - this.config.height * 0.7) / (this.config.height * 0.3);
            if (isLeftSide) {
              pixel.x += walkOffset * legFactor;
              pixel.y -= bounceOffset * (1 - legFactor);
            } else {
              pixel.x -= walkOffset * legFactor;
              pixel.y += bounceOffset * (1 - legFactor);
            }
          }

          // Arms movement with natural swing
          if (
            pixel.y < this.config.height * 0.5 &&
            (pixel.x < this.config.width * 0.3 ||
              pixel.x > this.config.width * 0.7)
          ) {
            const armFactor =
              Math.abs(this.config.width / 2 - pixel.x) /
              (this.config.width / 2);
            if (isLeftSide) {
              pixel.x -= walkOffset * armFactor;
            } else {
              pixel.x += walkOffset * armFactor;
            }
          }

          // Body bounce with smooth transition
          if (
            pixel.y >= this.config.height * 0.5 &&
            pixel.y <= this.config.height * 0.7
          ) {
            const bodyFactor =
              (pixel.y - this.config.height * 0.5) / (this.config.height * 0.2);
            pixel.y += Math.sin(cycle) * 1.5 * (1 - bodyFactor);
          }
        });
        break;
      }

      case AnimationState.ATTACK: {
        const range = animConfig.attackRange ?? Math.PI * 1.5;
        // Use easing for more impactful attack animation
        const attackProgress = this.easeInOutQuad(t);
        const attackAngle = attackProgress * range;
        const forwardLean = Math.sin(attackProgress * Math.PI) * 2;

        newPixels.forEach((pixel) => {
          // Right arm attack swing with improved arc
          if (
            pixel.x > this.config.width * 0.7 &&
            pixel.y < this.config.height * 0.5
          ) {
            const dx = pixel.x - this.config.width / 2;
            const dy = pixel.y - this.config.height / 2;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const baseAngle = Math.atan2(dy, dx);
            // Add acceleration to the swing
            const swingAngle =
              attackAngle * (1 + 0.5 * Math.sin(attackProgress * Math.PI));
            pixel.x =
              this.config.width / 2 + radius * Math.cos(baseAngle + swingAngle);
            pixel.y =
              this.config.height / 2 +
              radius * Math.sin(baseAngle + swingAngle);
          }

          // Body lean forward with weight shift
          if (pixel.y < this.config.height * 0.7) {
            const leanFactor = 1 - pixel.y / (this.config.height * 0.7);
            pixel.x += forwardLean * leanFactor;
          }
        });
        break;
      }
    }

    return {
      id: `${state}-${frameIndex}`,
      pixels: newPixels,
      state,
      index: frameIndex,
    };
  }

  public renderFrame(frame: Frame): ImageData {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    frame.pixels.forEach((pixel) => {
      this.ctx.fillStyle = pixel.color;
      this.ctx.fillRect(
        Math.round(pixel.x * this.config.scale),
        Math.round(pixel.y * this.config.scale),
        this.config.scale,
        this.config.scale
      );
    });

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  public generateSprite(): CharacterSprite {
    const frames: Frame[] = [];

    this.config.animations.forEach((animation) => {
      const baseFrame = this.generateBaseFrame(animation.state, 0);

      for (let i = 0; i < animation.frames; i++) {
        frames.push(this.generateAnimationFrame(baseFrame, animation.state, i));
      }
    });

    return {
      frames,
      width: this.config.width,
      height: this.config.height,
      config: this.config,
    };
  }

  public updateFramePixel(
    frame: Frame,
    x: number,
    y: number,
    color: string
  ): Frame {
    const pixelIndex = frame.pixels.findIndex(
      (p) =>
        Math.floor(p.x) === Math.floor(x / this.config.scale) &&
        Math.floor(p.y) === Math.floor(y / this.config.scale)
    );

    if (pixelIndex === -1) {
      frame.pixels.push({
        x: Math.floor(x / this.config.scale),
        y: Math.floor(y / this.config.scale),
        color,
      });
    } else {
      frame.pixels[pixelIndex].color = color;
    }

    return { ...frame, pixels: [...frame.pixels] };
  }

  public removeFramePixel(frame: Frame, x: number, y: number): Frame {
    const pixels = frame.pixels.filter(
      (p) =>
        Math.floor(p.x) !== Math.floor(x / this.config.scale) ||
        Math.floor(p.y) !== Math.floor(y / this.config.scale)
    );

    return { ...frame, pixels };
  }
}
