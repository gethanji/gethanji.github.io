import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://hanji.ink',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
