import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface SubdomainPortal {
    name: string;
    subdomains: string[];
    primarySubdomain: string;
    loginPath: string;
    authPaths?: string[];
    routes: string[];
}

const SUBDOMAIN_PORTALS: SubdomainPortal[] = [
    {
        name: 'Supply Chain',
        subdomains: ['sc', 'supplychain'],
        primarySubdomain: 'sc',
        loginPath: '/scAuth',
        authPaths: ['/scAuth'],
        routes: [
            '/inventory',
            '/warehousing',
            '/procurement',
            '/executive',
            '/forecast',
            '/documents',
            '/purchase-orders',
            '/suppliers',
            '/gallery',
            '/trash',
            '/user-activity',
        ],
    },
    {
        name: 'HR Dashboard',
        subdomains: ['hr'],
        primarySubdomain: 'hr',
        loginPath: '/hrAuth',
        authPaths: ['/hrAuth'],
        routes: [
            '/hr-dashboard',
            '/payroll-benefits-dashboard',
            '/performance-development-dashboard',
            '/workforce-management-hr2',
        ],
    },
    {
        name: 'CRBC',
        subdomains: ['crbc'],
        primarySubdomain: 'crbc',
        loginPath: '/crbcAuth/login',
        authPaths: [
            '/crbcAuth/login',
            '/crbcAuth',
            '/customerportalAuth/login',
            '/customerportalAuth/register',
            '/customerportalAuth',
        ],
        routes: ['/crbc', '/customer'],
    },
    {
        name: 'FTM',
        subdomains: ['ftm'],
        primarySubdomain: 'ftm',
        loginPath: '/ftmAuth',
        authPaths: ['/ftmAuth'],
        routes: ['/ftm'],
    },
    {
        name: 'FMS',
        subdomains: ['fms'],
        primarySubdomain: 'fms',
        loginPath: '/fmsAuth',
        authPaths: ['/fmsAuth'],
        routes: ['/fms'],
    },
    {
        name: 'Admin',
        subdomains: ['admin'],
        primarySubdomain: 'admin',
        loginPath: '/admin',
        authPaths: ['/admin'],
        routes: [],
    },
    {
        name: 'Customer Portal Login',
        subdomains: ['loginportal', 'portal'],
        primarySubdomain: 'loginportal',
        loginPath: '/customerportalAuth/login',
        authPaths: [
            '/customerportalAuth/login',
            '/customerportalAuth/register',
            '/customerportalAuth',
        ],
        routes: ['/customer'],
    },
    {
        name: 'Customer Portal Register',
        subdomains: ['registerportal'],
        primarySubdomain: 'registerportal',
        loginPath: '/customerportalAuth/register',
        authPaths: [
            '/customerportalAuth/login',
            '/customerportalAuth/register',
            '/customerportalAuth',
        ],
        routes: ['/customer'],
    },
];

// extract subdomain from hostname
function extractSubdomain(hostname: string): string | null {
    const host = hostname.split(':')[0].toLowerCase();
    const parts = host.split('.');

    if (parts[0] === 'www') return null;

    if (parts.length === 2 && parts[1] === 'localhost') {
        return parts[0];
    }

    if (parts.length >= 3) {
        return parts[0];
    }

    return null;
}

// get base domain
function extractBaseHost(hostname: string): string {
    const parts = hostname.split('.');

    if (parts.length === 2 && parts[1].startsWith('localhost')) {
        return parts[1];
    }

    if (parts.length >= 3) {
        return parts.slice(1).join('.');
    }

    return hostname;
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const hostname = request.headers.get('host') || '';
    const subdomain = extractSubdomain(hostname);
    const baseHost = extractBaseHost(hostname);
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    // no subdomain - redirect to correct subdomain
    if (!subdomain) {
        const portalWithLoginPath = SUBDOMAIN_PORTALS.find(
            (p) => pathname === p.loginPath || pathname.startsWith(p.loginPath + '/')
        );
        if (portalWithLoginPath) {
            const cleanUrl = `${protocol}://${portalWithLoginPath.primarySubdomain}.${baseHost}/${search}`;
            return NextResponse.redirect(new URL(cleanUrl));
        }

        const matchingPortal = SUBDOMAIN_PORTALS.find((portal) =>
            portal.routes.some((route) => pathname === route || pathname.startsWith(route + '/'))
        );
        if (matchingPortal) {
            const targetUrl = `${protocol}://${matchingPortal.primarySubdomain}.${baseHost}${pathname}${search}`;
            return NextResponse.redirect(new URL(targetUrl));
        }
    }

    // on subdomain
    if (subdomain) {
        const currentPortal = SUBDOMAIN_PORTALS.find((p) =>
            p.subdomains.some((s) => s.toLowerCase() === subdomain.toLowerCase())
        );

        if (currentPortal) {
            if (pathname === '/') {
                return NextResponse.rewrite(new URL(currentPortal.loginPath, request.url));
            }

            if (pathname === currentPortal.loginPath) {
                const cleanUrl = `${protocol}://${currentPortal.primarySubdomain}.${baseHost}/${search}`;
                return NextResponse.redirect(new URL(cleanUrl));
            }

            const isAllowedAuthPath = currentPortal.authPaths?.some(
                (p) => pathname === p || pathname.startsWith(p + '/')
            );
            if (isAllowedAuthPath) {
                return NextResponse.next();
            }

            const isValidPortalRoute = currentPortal.routes.some(
                (route) => pathname === route || pathname.startsWith(route + '/')
            );

            // check if route belongs to another portal
            const isForeignRoute = SUBDOMAIN_PORTALS.some((otherPortal) => {
                if (otherPortal === currentPortal) return false;

                const isForeignLogin =
                    pathname === otherPortal.loginPath ||
                    pathname.startsWith(otherPortal.loginPath + '/');

                const isForeignPageRoute = otherPortal.routes.some(
                    (route) => pathname === route || pathname.startsWith(route + '/')
                );

                return isForeignLogin || isForeignPageRoute;
            });

            if (isForeignRoute || (!isValidPortalRoute && currentPortal.primarySubdomain !== 'sc')) {
                const homeUrl = `${protocol}://${currentPortal.primarySubdomain}.${baseHost}/`;
                return NextResponse.redirect(new URL(homeUrl));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};