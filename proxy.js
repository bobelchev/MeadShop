import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
});

export const config = {
  // Match all paths except /api/*, /admin/*, /_next/*, and static files (contain a dot)
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
