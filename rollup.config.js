import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { marked } from 'marked';

// Read and process README.md
let readmeHTML = '';
try {
  const readmeContent = readFileSync('README.md', 'utf8');
  readmeHTML = marked(readmeContent);
} catch (error) {
  console.warn('Warning: Could not process README.md:', error.message);
}

// Export configuration
export default {
  input: 'src/ts/main.ts',
  output: {
    file: 'docs/game.js',
    format: 'iife',
    name: 'VersusBankGame',
    sourcemap: false, // No sourcemaps in production
    banner: `/*! VersusBank Web Game v1.0.0 | ${new Date().toISOString().split('T')[0]} */`
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false,
      declaration: false,
      declarationMap: false
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        properties: {
          regex: /^_/ // Mangle private properties
        }
      },
      format: {
        comments: /^!/
      }
    })
  ],
  // Inject processed README content
  context: 'window',
  moduleContext: {
    'readme-content': readmeHTML
  },
  // External dependencies (none for our vanilla JS approach)
  external: []
};