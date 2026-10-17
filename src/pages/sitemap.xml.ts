import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://www.ihornone.site';
  
  const staticPages = ['', '/about', '/services', '/my-services', '/templates', '/portfolio', '/blog', '/reviews', '/privacy'];
  
  const services = await getCollection('services');
  const projects = await getCollection('projects');
  const blog = await getCollection('blog');
  
  const serviceUrls = services.map(s => `/services/${s.id}`);
  const projectUrls = projects.map(p => `/portfolio/${p.id}`);
  const blogUrls = blog.map(b => `/blog/${b.id}`);
  
  const allUrls = [...staticPages, ...serviceUrls, ...projectUrls, ...blogUrls];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${siteUrl}${url}</loc>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
