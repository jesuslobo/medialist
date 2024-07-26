import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    if (request.method === "GET" || process.env.NODE_ENV !== "production")
        return NextResponse.next()

    // basic CSRF protection from lucia
    const originHeader = request.headers.get("Origin")
    const hostHeader = request.headers.get("Host")
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader]))
        return new NextResponse(null, { status: 403 })

    return NextResponse.next()
}