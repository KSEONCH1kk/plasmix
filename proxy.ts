import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich')) {
    const token = request.cookies.get('access_token')?.value;
    
    if (!token && pathname.includes('/dashboard')) {
      const loginUrl = new URL('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    if (token && pathname === '/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich') {
      const dashboardUrl = new URL('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [

    '/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich/:path*',
  ],
};

