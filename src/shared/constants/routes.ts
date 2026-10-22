export const Routes = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  SERVICE_DETAIL: (id: string) => `/services/${id}` as const,
  MY_SERVICES: '/my-services',
  TEMPLATES: '/templates',
  PORTFOLIO: '/portfolio',
  PORTFOLIO_DETAIL: (id: string) => `/portfolio/${id}` as const,
  BLOG: '/blog',
  BLOG_DETAIL: (id: string) => `/blog/${id}` as const,
  REVIEWS: '/reviews',
  EMAIL: '/email',
} as const;

export const SITE = {
  NAME: 'ihornone',
  URL: 'https://www.ihornone.site',
  LOCALE: 'uk_UA',
} as const;
