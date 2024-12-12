import { Frame, SpriteConfig } from "../types";

interface PixelEffect {
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  shade?: number; // 0-1, darkening factor
  antiAlias?: boolean;
  pattern?: "chain" | "plate" | "cloth" | "leather" | "magic" | "wood";
}

export class PixelManipulator {
  constructor(private config: SpriteConfig) {}

  public updateFramePixel(
    frame: Frame,
    x: number,
    y: number,
    color: string,
    effects?: PixelEffect
  ): Frame {
    const newPixels = [...frame.pixels];
    const scaledX = x;
    const scaledY = y;

    // Add main pixel
    this.addOrUpdatePixel(newPixels, scaledX, scaledY, color, effects);

    // Apply effects
    if (effects) {
      if (effects.pattern) {
        this.applyPattern(newPixels, scaledX, scaledY, color, effects.pattern);
      }
      if (effects.antiAlias) {
        this.addAntiAliasing(newPixels, scaledX, scaledY, color);
      }
      if (effects.glow) {
        this.addGlowEffect(newPixels, scaledX, scaledY, effects);
      }
    }

    return { ...frame, pixels: newPixels };
  }

  private addOrUpdatePixel(
    pixels: Frame["pixels"],
    x: number,
    y: number,
    color: string,
    effects?: PixelEffect
  ) {
    const pixelIndex = pixels.findIndex((p) => p.x === x && p.y === y);
    const finalColor = effects?.shade
      ? this.shadeColor(color, effects.shade)
      : color;

    if (pixelIndex === -1) {
      pixels.push({ x, y, color: finalColor });
    } else {
      pixels[pixelIndex] = { ...pixels[pixelIndex], color: finalColor };
    }
  }

  private addGlowEffect(
    pixels: Frame["pixels"],
    x: number,
    y: number,
    effects: PixelEffect
  ) {
    const glowColor = effects.glowColor || "#ffffff";
    const baseIntensity = effects.glowIntensity || 0.5;

    // Primary glow (adjacent pixels)
    const primaryGlow = [
      { pos: [x - 1, y], intensity: baseIntensity },
      { pos: [x + 1, y], intensity: baseIntensity },
      { pos: [x, y - 1], intensity: baseIntensity },
      { pos: [x, y + 1], intensity: baseIntensity },
    ];

    // Secondary glow (diagonal pixels)
    const secondaryGlow = [
      { pos: [x - 1, y - 1], intensity: baseIntensity * 0.7 },
      { pos: [x + 1, y - 1], intensity: baseIntensity * 0.7 },
      { pos: [x - 1, y + 1], intensity: baseIntensity * 0.7 },
      { pos: [x + 1, y + 1], intensity: baseIntensity * 0.7 },
    ];

    // Tertiary glow (outer pixels)
    const tertiaryGlow = [
      { pos: [x - 2, y], intensity: baseIntensity * 0.3 },
      { pos: [x + 2, y], intensity: baseIntensity * 0.3 },
      { pos: [x, y - 2], intensity: baseIntensity * 0.3 },
      { pos: [x, y + 2], intensity: baseIntensity * 0.3 },
    ];

    [...primaryGlow, ...secondaryGlow, ...tertiaryGlow].forEach(
      ({ pos: [gx, gy], intensity }) => {
        this.addOrUpdatePixel(
          pixels,
          gx,
          gy,
          this.adjustColorAlpha(glowColor, intensity)
        );
      }
    );
  }

  private addAntiAliasing(
    pixels: Frame["pixels"],
    x: number,
    y: number,
    color: string
  ) {
    // Primary anti-aliasing positions (diagonal)
    const primaryPositions = [
      { pos: [x - 1, y - 1], alpha: 0.3 },
      { pos: [x + 1, y - 1], alpha: 0.3 },
      { pos: [x - 1, y + 1], alpha: 0.3 },
      { pos: [x + 1, y + 1], alpha: 0.3 },
    ];

    // Secondary anti-aliasing positions (adjacent)
    const secondaryPositions = [
      { pos: [x - 1, y], alpha: 0.4 },
      { pos: [x + 1, y], alpha: 0.4 },
      { pos: [x, y - 1], alpha: 0.4 },
      { pos: [x, y + 1], alpha: 0.4 },
    ];

    // Add all anti-aliasing pixels with varying intensities
    [...primaryPositions, ...secondaryPositions].forEach(
      ({ pos: [ax, ay], alpha }) => {
        if (!pixels.some((p) => p.x === ax && p.y === ay)) {
          this.addOrUpdatePixel(
            pixels,
            ax,
            ay,
            this.adjustColorAlpha(color, alpha)
          );
        }
      }
    );
  }

  private applyPattern(
    pixels: Frame["pixels"],
    x: number,
    y: number,
    color: string,
    pattern: string
  ) {
    let patternColor: string | undefined;
    let patternIntensity: number | undefined;

    const applyPattern = (shade: number, intensity: number) => {
      patternColor = this.shadeColor(color, shade);
      patternIntensity = intensity;
    };

    // More subtle and consistent patterns
    switch (pattern) {
      case "chain":
        // Enhanced chainmail pattern with overlapping rings
        const ringX = Math.sin(x * 0.8) * 0.02;
        const ringY = Math.cos(y * 0.8) * 0.02;
        if ((x + y) % 2 === 0) {
          applyPattern(0.92 + ringX, 0.95);
        } else if ((x + y) % 3 === 0) {
          applyPattern(0.88 + ringY, 0.95);
        }
        break;
      case "plate":
        // Enhanced plate armor with beveled edges and highlights
        const edgeHighlight = Math.sin(y * 0.2) * 0.03;
        if (y % 2 === 0) {
          applyPattern(0.95 + edgeHighlight, 0.98);
        } else if (y % 4 === 1) {
          applyPattern(1.05 + edgeHighlight, 0.98);
        } else if (x % 3 === 0) {
          applyPattern(0.97 + edgeHighlight, 0.98);
        }
        break;
      case "cloth":
        // Enhanced cloth texture with weave pattern
        const weaveX = Math.sin(x * 0.5) * 0.02;
        const weaveY = Math.cos(y * 0.5) * 0.02;
        if ((x + y) % 4 === 0) {
          applyPattern(0.97 + weaveX, 0.98);
        } else if ((x - y) % 3 === 0) {
          applyPattern(0.95 + weaveY, 0.98);
        }
        break;
      case "leather":
        // Enhanced leather texture with natural grain
        const grainX = Math.sin(x * 0.3 + y * 0.2) * 0.03;
        const grainY = Math.cos(x * 0.2 + y * 0.3) * 0.03;
        if ((x + y) % 3 === 0 || (x - y) % 3 === 0) {
          applyPattern(0.95 + grainX, 0.98);
        } else if ((x * y) % 5 === 0) {
          applyPattern(0.93 + grainY, 0.98);
        }
        break;
      case "magic":
        // Enhanced magical effect with complex pulsing
        const pulseX = Math.sin(x * 0.1) * 0.03;
        const pulseY = Math.cos(y * 0.1) * 0.03;
        const pulse = 1 + Math.sin(x * y * 0.05 + Date.now() * 0.001) * 0.05;
        applyPattern(pulse + pulseX + pulseY, 0.98);
        break;
      case "wood":
        // Enhanced wood grain with natural variations
        const primaryGrain = Math.sin((x * 0.7 + y * 0.3) * 0.8) * 0.04;
        const secondaryGrain = Math.cos((x * 0.3 + y * 0.7) * 0.5) * 0.02;
        const knot =
          Math.exp(
            -(Math.pow((x % 10) - 5, 2) + Math.pow((y % 8) - 4, 2)) * 0.1
          ) * 0.05;
        applyPattern(0.95 + primaryGrain + secondaryGrain + knot, 0.98);
        break;
    }

    if (patternColor !== undefined && patternIntensity !== undefined) {
      this.addOrUpdatePixel(
        pixels,
        x,
        y,
        this.adjustColorAlpha(patternColor, patternIntensity)
      );
    }
  }

  private shadeColor(color: string, factor: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    return this.rgbToHex(
      Math.round(rgb.r * factor),
      Math.round(rgb.g * factor),
      Math.round(rgb.b * factor)
    );
  }

  private adjustColorAlpha(color: string, alpha: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
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
        const hex = Math.min(255, Math.max(0, x)).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
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
