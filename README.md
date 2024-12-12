# Pixel Sprite Generator

A TypeScript-based tool for generating pixel art sprite sheets with different animation states (idle, walk, attack) for game characters.

## Features

- Generate pixel art character sprites
- Multiple animation states:
  - Idle (breathing animation)
  - Walk (moving legs and arms)
  - Attack (arm swinging animation)
- Real-time preview in browser
- Download sprite sheets as PNG
- Configurable sprite dimensions and animation frames

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
  animations: [
    { state: AnimationState.IDLE, frames: 4, duration: 500 },
    { state: AnimationState.WALK, frames: 6, duration: 100 },
    { state: AnimationState.ATTACK, frames: 4, duration: 100 },
  ],
};
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build production version

## Project Structure

```
sprite-generator/
├── src/
│   ├── index.ts          # Main application entry
│   ├── index.html        # HTML template
│   ├── types.ts          # TypeScript interfaces and types
│   └── SpriteGenerator.ts # Sprite generation logic
├── webpack.config.js     # Webpack configuration
├── tsconfig.json         # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## License

ISC License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
