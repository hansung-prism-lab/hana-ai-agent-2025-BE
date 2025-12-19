import * as esbuild from 'esbuild';
import { resolve } from 'path';

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node22',
      outfile: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      external: [
        // Keep native/binary or runtime-resolved deps out of the bundle
        'bcrypt',
        'mock-aws-s3',
        'aws-sdk',
        'nock',
        '@mapbox/node-pre-gyp',
        'node-pre-gyp',
        // Prisma must remain external so that its engines are resolved from node_modules
        '@prisma/client',
        '.prisma/client',
        '@prisma/engines',
        // Swagger UI must stay external so that static assets from swagger-ui-dist are available at runtime
        'swagger-ui-express',
        'swagger-ui-dist'
      ],
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 