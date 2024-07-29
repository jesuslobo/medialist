import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Session, User } from "lucia";
import { Lucia, TimeSpan } from "lucia";
import type { NextApiRequest, NextApiResponse } from "next";

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes; //should would be Omit<UserData, 'id'>
        DatabaseSessionAttributes: DatabaseSessionAttributes;
    }
    interface DatabaseUserAttributes {
        username: string;
    }
    interface DatabaseSessionAttributes {
    }
}

const adapter = new DrizzleSQLiteAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(4, "w"),
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username
        };
    }
    // getSessionAttributes: (attributes) => {
    // 	return {
    //         // Add any session attributes here
    //   };
    // }
})

export async function validateAuthCookies(req: NextApiRequest, res: NextApiResponse):
    Promise<{ user: User; session: Session } | { user: null; session: null }> {
    try {

        const sessionId = req.cookies[lucia.sessionCookieName]
        if (!sessionId) return { user: null, session: null }

        const result = await lucia.validateSession(sessionId)

        if (!result.session)
            res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())

        if (result.session?.fresh)
            res.setHeader("Set-Cookie", lucia.createSessionCookie(result.session.id).serialize())

        return result
    } catch (error) {
        console.error("[Error] validateAuthCookies(): ", error)
        return { user: null, session: null }
    }
}

export const argon2Options = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
}

export const notValidPassword = (password: string) => typeof password !== "string" || password.length < 6; // Maybe add a Max Length?
export const notValidUsername = (username: string) => typeof (username) !== 'string' || username.length < 3 || username.length > 31;