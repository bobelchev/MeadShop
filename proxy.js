import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
});

// Matches /bg/shop*, /en/shop*, /bg/checkout, /en/checkout
const AGE_GATE_PATTERN = /^\/(?:bg|en)\/(?:shop(?:\/|$)|checkout(?:\/|$))/;

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Age gate: block unverified visitors from shop and checkout routes
  if (AGE_GATE_PATTERN.test(pathname)) {
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
