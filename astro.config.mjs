import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://hanji.ink',
  output: 'static',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
