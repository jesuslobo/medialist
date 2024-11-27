import { NextApiRequest, NextApiResponse } from "next";
import { $validateSessionToken, ServerSessionValidationResult } from "./session";

const IS_PROD = process.env.NODE_ENV === "production"; // HTTPS
const SESSION_LOCAL_STORAGE_KEY = "session";

export function $setSessionTokenCookie(res: NextApiResponse, token: string, expiresAt: Date) {
    res.appendHeader(
        "Set-Cookie",
        `${SESSION_LOCAL_STORAGE_KEY}=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/${IS_PROD ? '; Secure;' : ''}`
    )
}

export function $deleteSessionTokenCookie(res: NextApiResponse) {
    res.appendHeader(
        "Set-Cookie",
        `${SESSION_LOCAL_STORAGE_KEY}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/${IS_PROD ? '; Secure;' : ''}`
    )
}

/** this will modify cookies */
export async function $validateAuthCookies(req: NextApiRequest, res: NextApiResponse): Promise<ServerSessionValidationResult> {
    try {
        const token = req.cookies[SESSION_LOCAL_STORAGE_KEY]
        if (!token) return { user: null, session: null }

        const result = await $validateSessionToken(token)

        if (result.session) {
            $setSessionTokenCookie(res, token, result.session.expiresAt)
        } else {
            $deleteSessionTokenCookie(res)
        }

        return result
    } catch (error) {
        console.error("[Error] validateAuthCookies(): ", error)
        return { user: null, session: null }
    }
}