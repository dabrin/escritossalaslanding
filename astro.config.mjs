import { defineConfig } from 'astro/config';

// En GitHub Actions, GITHUB_REPOSITORY = "usuario/repo": de ahí salen `site` y `base`.
// En local (o con dominio propio) no se define y la página sirve desde la raíz.
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const pages = owner
  ? { site: `https://${owner}.github.io`, base: repo.endsWith('.github.io') ? '/' : `/${repo}` }
  : {};

export default defineConfig(pages);
