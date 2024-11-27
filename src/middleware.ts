import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    if (request.method === "GET" || process.env.NODE_ENV !== "production")
        return NextResponse.next()

    const originHeader = request.headers.get("Origin")
    const hostHeader = request.headers.get("Host")
    if (!originHeader || !hostHeader || originHeader !== hostHeader)
        return new NextResponse(null, { status: 403 })

    return NextResponse.next()
}