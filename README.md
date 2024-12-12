# Pixel Sprite Generator

A TypeScript-based tool for generating pixel art sprite sheets with different animation states (idle, walk, attack) for game characters.

## Features

- Generate pixel art character sprites
- Multiple animation states with advanced animations:
  - Idle with smooth breathing animation
  - Walk with physics-based leg and arm movement
  - Attack with dynamic weapon swing
- Interactive sprite editing: - Draw tool with color picker - Erase tool - Grid overlay for precise editing
- Real-time animation preview
- Project management: - Save projects as JSON - Load and continue editing - Export as PNG (individual frames or sprite sheets)
- Configurable sprite properties: - Dimensions and scale - Animation parameters - Custom colors for different parts
- Frame-by-frame navigation
- Animation playback controls

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

4. Open your browser and navigate to `http://localhost:3000`

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
│   ├── types.ts                    # TypeScript interfaces and types
│   ├── SpriteGenerator.ts          # Main sprite generation coordinator
│   ├── generators/                 # Sprite generation components
│   │   ├── AnimationFrameGenerator.ts  # Animation frame transformations
│   │   ├── BaseFrameGenerator.ts       # Base character frame generation
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

- **BaseFrameGenerator**: Creates initial character frames with proper structure
- **AnimationFrameGenerator**: Applies animation transformations to base frames
- **FrameRenderer**: Handles all canvas rendering operations
- **PixelManipulator**: Manages pixel-level modifications
- **EasingUtils**: Provides animation easing functions

### Managers

- **AnimationManager**: Controls animation state and playback
- **CanvasManager**: Manages canvas operations and rendering
- **FileManager**: Handles file operations (save/load/download)
- **UIManager**: Coordinates UI interactions and event handling

The main `SpriteGenerator` class acts as a facade, coordinating between these specialized components to provide a cohesive sprite generation system.

## License

ISC License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
