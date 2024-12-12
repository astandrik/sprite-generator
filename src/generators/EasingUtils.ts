export class EasingUtils {
  // Smooth quadratic easing
  public static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // Smooth sinusoidal easing
  public static easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  // Natural bounce effect
  public static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  // Elastic movement for weapon swings
  public static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  // Back easing for anticipation
  public static easeInBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  }

  // Quick start, slow end
  public static easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // Natural breathing animation combining multiple frequencies
  public static breathing(t: number): number {
    // Primary breathing motion
    const mainBreath = Math.sin(t * Math.PI * 2) * 0.05;
    // Subtle variation in breathing rhythm
    const variation = Math.sin(t * Math.PI * 1.5) * 0.015;
    // Very subtle micro-movements
    const microMovement = Math.sin(t * Math.PI * 8) * 0.005;

    return 0.5 + mainBreath + variation + microMovement;
  }

  // Enhanced walking cycle with natural momentum and weight shift
  public static walkCycle(t: number): number {
    // Main stride motion with improved natural movement
    const stride = Math.sin(t * Math.PI * 2);

    // Enhanced acceleration curve for more natural foot movement
    const acceleration = Math.pow(Math.abs(stride), 1.8) * Math.sign(stride);

    // Improved step timing with heel-to-toe motion
    const heelStrike = Math.max(0, Math.sin(t * Math.PI * 4 - Math.PI / 4));
    const toePush = Math.max(0, Math.sin(t * Math.PI * 4 + Math.PI / 4));

    // Add natural pause at the extremes of the stride
    const stepPause = Math.cos(t * Math.PI * 4) * 0.15 * (1 - Math.abs(stride));

    // Combine movements with weight distribution
    const weightShift = Math.sin(t * Math.PI * 2 - Math.PI / 6) * 0.2;

    return (
      acceleration * 0.6 + // Base stride
      stepPause + // Natural pause
      heelStrike * 0.2 - // Heel strike impact
      toePush * 0.15 + // Toe push-off
      weightShift // Weight shift
    );
  }

  // New function for hip sway during walk
  public static hipSway(t: number): number {
    const mainSway = Math.sin(t * Math.PI * 2) * 0.3;
    const secondarySway = Math.sin(t * Math.PI * 4) * 0.1;
    return mainSway + secondarySway;
  }

  // New function for torso rotation during walk
  public static torsoRotation(t: number): number {
    const mainRotation = Math.sin(t * Math.PI * 2 - Math.PI / 6) * 0.2;
    const counterRotation = Math.sin(t * Math.PI * 4) * 0.05;
    return mainRotation + counterRotation;
  }

  // Dynamic attack swing with anticipation and follow-through
  public static attackSwing(t: number): number {
    if (t < 0.2) {
      // Anticipation phase - slight pullback
      return EasingUtils.easeInBack(t * 5) * -0.2;
    } else if (t < 0.6) {
      // Main attack swing with acceleration
      const swingT = (t - 0.2) * 2.5;
      return EasingUtils.easeOutExpo(swingT);
    } else {
      // Follow-through and recovery
      const recoveryT = (t - 0.6) * 2.5;
      const elastic = EasingUtils.easeOutElastic(recoveryT);
      return 1 - (1 - elastic) * 0.3;
    }
  }

  // Jump arc
  public static jumpArc(t: number): number {
    const bounce = EasingUtils.easeOutBounce(t);
    return -4 * t * (t - 1) + bounce * 0.2;
  }
}
