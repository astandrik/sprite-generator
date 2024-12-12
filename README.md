# Pixel Sprite Generator

A TypeScript-based tool for generating pixel art sprite sheets with different animation states (idle, walk, attack) for game characters.

## Features

- Advanced Character Generation: - Multiple character types (Warrior, Mage, Rogue)
  - Random variations in proportions and features
  - Customizable body types (Slim, Normal, Bulky)
  - Character-specific weapons and accessories
    - Unique color palettes for each type
    - Regenerate variations while keeping type
- Multiple animation states with advanced animations: - Idle with smooth breathing animation - Walk with physics-based leg and arm movement - Attack with dynamic weapon swing
- Interactive sprite editing: - Draw tool with color picker - Erase tool - Grid overlay for precise editing
- Real-time animation preview
- Project management: - Save projects as JSON with character data - Load and continue editing - Export as PNG (individual frames or sprite sheets)
- Configurable sprite properties: - Dimensions and scale - Animation parameters - Custom colors for different parts
- Frame-by-frame navigation
- Animation playback controls

## Character Types

### Warrior

- Bulkier body type
- Equipped with sword
- Heavy armor options
- Wider stance for stability

### Mage

- Slim or normal body type
- Magical staff with orb
- Robe and hat options
- Mystical color schemes

### Rogue

- Slim and agile appearance
- Dagger weapon
- Cape and hood options
- Dark, stealthy color palettes

## Setup

1. Clone the repository:

```bash
git clone https://github.com/astandrik/sprite-generator.git
cd sprite-generator
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3001`

## Usage

1. Click the "Generate Sprite Sheet" button to create a new sprite sheet with all animation states
2. Preview the generated sprites in the canvas
3. Click "Download Sprite Sheet" to save the sprite sheet as a PNG file

## Sprite Sheet Structure

The generated sprite sheet contains the following animations in sequence:

- Idle: 4 frames
- Walk: 6 frames
- Attack: 4 frames

Each frame is 32x32 pixels, and animations are arranged horizontally.

## Configuration

You can modify the sprite generation settings in `src/index.ts`:

```typescript
const config: SpriteConfig = {
  width: 32,
  height: 32,
  scale: 10,
  animations: [
    {
      state: AnimationState.IDLE,
      frames: 8,
      frameDelay: 150,
      config: {
        breathingIntensity: 1.2,
        colors: {
          body: "#000000",
          outline: "#444444",
        },
      },
    },
    {
      state: AnimationState.WALK,
      frames: 12,
      frameDelay: 80,
      config: {
        walkingSpeed: 2.5,
        colors: {
          body: "#000000",
          outline: "#444444",
        },
      },
    },
    {
      state: AnimationState.ATTACK,
      frames: 10,
      frameDelay: 60,
      config: {
        attackRange: Math.PI * 1.5,
        colors: {
          body: "#000000",
          outline: "#444444",
          weapon: "#666666",
        },
      },
    },
  ],
};
```

Each animation state can be configured with:

- Number of frames
- Frame delay (animation speed)
- State-specific parameters (breathing intensity, walking speed, attack range)
- Custom colors for different parts (body, outline, weapon)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build production version

## Project Structure

```
sprite-generator/
├── src/
│   ├── index.ts                    # Main application entry
│   ├── index.html                  # HTML template
│   ├── types.ts                    # Core TypeScript interfaces
│   ├── types/                      # Type definitions
│   │   └── character.ts            # Character-specific types
│   ├── SpriteGenerator.ts          # Main sprite generation coordinator
│   ├── generators/                 # Sprite generation components
│   │   ├── AnimationFrameGenerator.ts  # Animation frame transformations
│   │   ├── BaseFrameGenerator.ts       # Base character frame generation
│   │   ├── CharacterGenerator.ts       # Character type generation
│   │   ├── EasingUtils.ts              # Animation easing functions
│   │   ├── FrameRenderer.ts            # Canvas rendering operations
│   │   └── PixelManipulator.ts         # Pixel-level operations
│   └── managers/                   # Application managers
│       ├── AnimationManager.ts     # Animation state and playback
│       ├── CanvasManager.ts        # Canvas operations
│       ├── FileManager.ts          # File operations
│       └── UIManager.ts            # UI interactions
├── webpack.config.js              # Webpack configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project dependencies and scripts
```

## Architecture

The project follows a modular architecture with clear separation of concerns:

### Generators

- **CharacterGenerator**: Manages character type generation and customization - Generates random character configurations - Handles character type-specific features - Manages color palettes and variations - Controls body proportions and accessories
- **BaseFrameGenerator**: Creates initial character frames - Builds character structure based on type - Applies character-specific features (weapons, armor) - Handles proportions and body types
- **AnimationFrameGenerator**: Applies animation transformations - Character-specific animation behaviors - Physics-based movement calculations - Smooth transitions and easing
- **FrameRenderer**: Handles all canvas rendering operations - Pixel-perfect rendering - Scale handling - Canvas context management
- **PixelManipulator**: Manages pixel-level modifications - Precise pixel placement - Color management - Outline generation
- **EasingUtils**: Provides animation easing functions - Smooth animation curves - Physics-based motion

### Managers

- **AnimationManager**: Controls animation state and playback - Frame sequencing - Animation timing - State transitions
- **CanvasManager**: Manages canvas operations and rendering - Canvas setup and scaling - Grid overlay - Drawing context
- **FileManager**: Handles file operations - Project saving with character data - Loading and validation - PNG export
- **UIManager**: Coordinates UI interactions - Character generation controls - Animation controls - Drawing tools - State management

The main `SpriteGenerator` class acts as a facade, coordinating between these specialized components to provide a cohesive character sprite generation system. It manages the interaction between character generation, animation, and rendering components while maintaining a clean separation of concerns.

## License

ISC License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
