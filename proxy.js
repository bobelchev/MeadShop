import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
});

// Matches /bg/shop, /en/shop, /bg/shop/123, /bg/shop/456, etc.
const SHOP_PATTERN = /^\/(?:bg|en)\/shop(?:\/|$)/;

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Age gate: block unverified visitors from all /[locale]/shop* routes
  // Exclude /[locale]/age-gate itself (infinite loop prevention)
  if (SHOP_PATTERN.test(pathname)) {
    const verified = request.cookies.get('age_verified')?.value;
    if (verified !== '1') {
      const locale = pathname.startsWith('/en') ? 'en' : 'bg';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/age-gate`;
      url.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Fall through to next-intl locale routing
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except /api/*, /admin/*, /_next/*, and static files (contain a dot)
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
