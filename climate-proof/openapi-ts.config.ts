import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.docs.riskthinking.ai/openapi-public.yml', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    '@tanstack/react-query',
  ]
});