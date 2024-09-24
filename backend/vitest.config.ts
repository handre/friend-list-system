import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import * as toml from 'toml';
import * as fs from 'fs';


// Read and parse the wrangler.toml file
const wranglerConfig = toml.parse(fs.readFileSync('./wrangler.toml', 'utf-8'));

// Extract the test DATABASE_URL
const testDatabaseUrl = wranglerConfig.env.test.vars.DATABASE_URL;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.ts',
    poolOptions: {
      workers: {
        wrangler: { config: './wrangler.toml' }
      }
    },
    env: {
      DATABASE_URL: testDatabaseUrl,
    },
  },
});