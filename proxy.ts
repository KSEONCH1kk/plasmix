import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, что это запрос к админ-панели
  if (pathname.startsWith('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich')) {
    // Проверяем наличие токена в cookies
    const token = request.cookies.get('access_token')?.value;
    
    // Если нет токена и пользователь пытается попасть в dashboard
    if (!token && pathname.includes('/dashboard')) {
      // Редирект на страницу логина
      const loginUrl = new URL('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Если есть токен и пользователь на странице логина (но не на dashboard)
    if (token && pathname === '/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich') {
      // Редирект в dashboard
      const dashboardUrl = new URL('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Применяем proxy только к админ-панели
    '/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich/:path*',
  ],
};

