import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// if not provided, it will Allow ALl Origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim()) || []
const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
    if (request.method === "GET" || process.env.NODE_ENV !== "production" || ALLOWED_ORIGINS.length === 0)
        return NextResponse.next()

    // Origin Check
    const origin = request.headers.get("Origin") ?? ''
    const host = request.headers.get("Host")
    const isOriginAllowed = ALLOWED_ORIGINS.includes(origin)

    if (!origin || !host || !isOriginAllowed)
        return new NextResponse(null, { status: 403 })

    //  preflighted
    const isPreflight = request.method === 'OPTIONS'

    if (isPreflight) {
        const headers = {
            ...(isOriginAllowed && { 'Access-Control-Allow-Origin': origin }),
            ...corsHeaders,
        }
        return NextResponse.json({}, { headers })
    }

    const response = NextResponse.next()

    if (isOriginAllowed)
        response.headers.set('Access-Control-Allow-Origin', origin)

    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

export const config = {
    matcher: '/api/:path*',
}