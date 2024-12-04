import { db } from "@/server/db";
import { Session, sessionsTable, User, usersTable } from "@/server/db/schema";
import { SessionAgent } from "@/utils/types/global";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { userAgentFromString } from "next/server";

const SESSION_LIFETIME = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_REFRESH_THRESHOLD = SESSION_LIFETIME / 2;

export function $generateSessionToken() {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function $createSession(token: string, userId: string, agentString?: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const { os, browser, device } = userAgentFromString(agentString || "")

	const session: Session = {
		id: sessionId,
		agent: { os: os?.name, browser: browser?.name, device: device?.type } as SessionAgent,
		userId,
		expiresAt: new Date(Date.now() + SESSION_LIFETIME),
		createdAt: new Date(Date.now())
	}
	await db.insert(sessionsTable).values(session)

	return session
}

export async function $validateSessionToken(token: string): Promise<ServerSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	// if exists
	const result = await db
		.select({ user: usersTable, session: sessionsTable })
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId));

	if (result.length < 1) return { session: null, user: null }

	const { user, session } = result[0]

	// if expired
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
		return { session: null, user: null };
	}

	// if within refresh threshold -> refresh
	if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_THRESHOLD) {
		session.expiresAt = new Date(Date.now() + SESSION_LIFETIME);
		await db
			.update(sessionsTable)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessionsTable.id, session.id));
	}

	return { session, user }
}

export async function $invalidateSession(sessionId: string) {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export type ServerSessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };