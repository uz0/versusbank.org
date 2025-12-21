# VersusBank - 16-bit Retro Web Game

A retro-style 16-bit web game built with vanilla TypeScript and Canvas API.

## Features

- **16-bit Retro Graphics**: Classic pixel art style with modern web technology
- **Progressive Web App**: Installable on mobile and desktop
- **Cross-Platform**: Works on Windows, macOS, Linux, iOS, and Android
- **Performance Optimized**: Smooth 60 FPS gameplay
- **Responsive Design**: Adapts to different screen sizes

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/versusbank.org.git
cd versusbank.org

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production version
- `npm run serve` - Start production server
- `npm run test` - Run all tests
- `npm run test:headed` - Run tests in headed mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:performance` - Run performance tests
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run validate` - Run type-check, build, test, and lint
- `npm run clean` - Clean build artifacts

## Testing

The project includes comprehensive testing infrastructure:

### End-to-End Tests
- Basic rendering tests
- Cross-platform compatibility
- Screenshot consistency
- Console error detection

### Performance Tests
- Page load time
- Canvas rendering performance
- Memory usage monitoring
- Screenshot reliability

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (useful for debugging)
npm run test:headed

# Run specific test suites
npm run test:e2e
npm run test:performance
```

## Cross-Platform Compatibility

The game is designed to work across all major platforms:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Operating Systems**: Windows, macOS, Linux, iOS, Android

### Screenshot Testing

Automated screenshot testing ensures visual consistency:

- Tests run on Windows, macOS, and Linux in CI
- Screenshots are compared for visual regressions
- Platform-specific differences are normalized
- Failing tests generate detailed difference reports

## Development

### Project Structure

```
src/
├── ts/           # TypeScript source code
├── js/           # Compiled JavaScript
└── typings/      # Type definitions

tests/
├── e2e/          # End-to-end tests
├── performance/  # Performance tests
└── utils/        # Test utilities

scripts/          # Build scripts
public/           # Static assets
docs/             # Built application
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code style
- **Playwright**: Reliable automated testing
- **GitHub Actions**: Continuous integration

## Performance

- **Bundle Size**: Optimized for fast loading
- **Frame Rate**: Maintains 60 FPS gameplay
- **Memory**: Efficient memory usage
- **Network**: Minimal asset loading

## Deployment

The application builds to static files in the `docs/` directory, ready for deployment to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Firebase Hosting

### Deploy to GitHub Pages

```bash
# Build the application
npm run build

# Deploy to GitHub Pages (using gh-pages branch)
git add docs/
git commit -m "Update build"
git subtree push --prefix docs origin gh-pages
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the test suite: `npm run validate`
5. Submit a pull request

## License

Unlicense - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web standards
- Inspired by classic 16-bit games
- Powered by TypeScript and Canvas API