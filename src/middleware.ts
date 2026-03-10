import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';
import {
  updateSession,
  getLocaleFromPathname,
  isDashboardPath,
} from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: Request) {
  const nextRequest = request as import('next/server').NextRequest;
  const response = intlMiddleware(nextRequest);

  // next-intl이 이미 리다이렉트한 경우 그대로 반환
  if (response.status === 307 || response.status === 308 || response.headers.get('Location')) {
    return response;
  }

  const { response: resWithSession, user } = await updateSession(
    nextRequest,
    response as import('next/server').NextResponse
  );

  const pathname = nextRequest.nextUrl.pathname;
  if (isDashboardPath(pathname) && !user) {
    const locale = getLocaleFromPathname(pathname);
    const loginUrl = new URL(`/${locale}/login`, nextRequest.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return resWithSession;
}

// next-intl이 as-needed일 때 기본 locale(ko)은 /login처럼 prefix 없이 접근 가능한데,
// 이 경로들도 미들웨어를 타야 [locale] 라우트로 매칭됩니다.
export const config = {
  matcher: [
    '/',
    '/(ko|en|zh|ja)/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/login/:path*',
    '/signup',
    '/signup/:path*',
    '/order',
    '/order/:path*',
  ],
};
