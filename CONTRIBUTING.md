# Contributing to VersusBank

VersusBank is a 16-bit retro financial game built as a Progressive Web App (PWA). We welcome contributions from the community!

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Getting Started

1. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/versusbank.org.git
   cd versusbank.org
   npm install
   ```

2. **Development commands**
   ```bash
   npm run dev      # Start development server
   npm run build    # Build for production
   npm run start    # Preview production build
   npm run lint     # Run ESLint
   npm run test     # Run E2E tests
   npm run type     # Type checking
   npm run fix      # Auto-fix ESLint issues
   ```

## Code Style

- **TypeScript** with strict mode enabled
- **ESLint** for code quality
- **Modular architecture** with clear separation of concerns
- **16-bit retro aesthetic** in both code and UI

## Project Structure

```
src/
├── ts/
│   ├── Game.ts              # Main game engine
│   ├── Renderer.ts          # WebGL2 rendering system
│   ├── SceneManager.ts      # Scene management
│   ├── InputHandler.ts      # Input processing
│   ├── AssetManager.ts      # Asset loading and caching
│   ├── ContentManager.ts    # Markdown content rendering
│   ├── scenes/              # Game scenes
│   │   └── MenuScene.ts     # Main menu implementation
│   ├── pwa/                 # PWA functionality
│   │   └── InstallManager.ts # PWA install prompts
│   ├── styles/              # CSS modules
│   └── main.ts              # Application entry point
├── icons/                   # PWA icons in various sizes
└── index.html              # Main HTML file
```

## Contributing Guidelines

### Bug Reports
- Use GitHub Issues with clear descriptions
- Include steps to reproduce
- Provide browser/environment information

### Feature Requests
- Open an Issue with the "enhancement" label
- Describe the feature and its use case
- Consider the 16-bit retro theme

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code style
4. Test thoroughly (`npm run test`, `npm run type`, `npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Review Process
- All PRs require review
- Must pass all automated checks
- Follow the existing code patterns
- Maintain the retro aesthetic

## Development Notes

### Game Architecture
- **Scene-based**: Menu, Game, and Content scenes
- **Event-driven**: Input handling and state management
- **Asset pipeline**: Optimized for web delivery
- **PWA-first**: Offline-capable with install prompts

### Performance Considerations
- **WebGL2** for hardware-accelerated rendering
- **Asset caching** for offline play
- **Lazy loading** of game content
- **Memory management** for scene transitions

### Testing
- **E2E tests** with Playwright
- **Type checking** with TypeScript
- **Linting** with ESLint
- **Manual testing** across devices

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Getting Help

- Check existing Issues for similar problems
- Read the project documentation
- Ask questions in Issues with the "question" label

---

Happy coding! 🎮✨