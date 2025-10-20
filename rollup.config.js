import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
  // CommonJS build
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      production && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          reserved: ['NuwaultCore']
        }
      })
    ].filter(Boolean)
  },
  // UMD build for browsers
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/nuwault-core.umd.js',
      format: 'umd',
      name: 'NuwaultCore',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve({
        preferBuiltins: false
      }),
      production && terser({
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        mangle: {
          reserved: ['NuwaultCore']
        }
      })
    ].filter(Boolean)
  }
]; 