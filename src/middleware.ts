/* Trailing-slash canonicalization: /page → /page/ (308).
   Covers astro dev (which 404s non-slash paths under trailingSlash: 'always')
   and any path not matched by public/_redirects in production. */
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  const last = pathname.split('/').pop() ?? '';
  const isFile = last.includes('.');
  if (pathname !== '/' && last && !pathname.endsWith('/') && !isFile) {
    return context.redirect(pathname + '/', 308);
  }
  return next();
});
