import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';
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

const isWatch = process.argv.includes('--watch');

export default {
  input: 'src/ts/main.ts',
  output: {
    file: 'dev/game.js',
    format: 'iife',
    name: 'VersusBankGame',
    sourcemap: 'inline', // Include sourcemaps for debugging
    banner: `/*! VersusBank Web Game (Development) | ${new Date().toISOString()} */`
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSourceMap: true,
      declaration: false,
      declarationMap: false
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    // Development server
    ...(isWatch ? [
      serve({
        open: true,
        contentBase: 'dev',
        port: 3000,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/html'
        }
      })
    ] : [])
  ],
  context: 'window',
  moduleContext: {
    'readme-content': readmeHTML
  },
  external: [],

  // Development-specific options
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: false
  },

  // Development optimization
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  },

  // Generate bundle analysis in development
  onwarn: (warning, warn) => {
    // Suppress certain warnings in development
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};