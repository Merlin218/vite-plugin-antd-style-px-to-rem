import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry points
  entry: ['index.ts'],
  
  // Output formats
  format: ['cjs', 'esm'],
  
  // Generate type declarations
  dts: true,
  
  // Clean output directory before build
  clean: true,
  
  // Generate sourcemaps
  sourcemap: true,
  
  // Bundle dependencies
  external: ['vite'],
  
  // Minify output
  minify: false,
  
  // Target environment
  target: 'node14',
  
  // Keep folder structure
  splitting: false,
  
  // Entry file names
  outDir: 'dist',
  
  // TypeScript config
  tsconfig: 'tsconfig.json'
}) 