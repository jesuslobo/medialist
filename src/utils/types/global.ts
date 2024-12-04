import { ListData } from "./list";

export interface TagData {
    id: string;
    userId: UserData['id'];
    listId: ListData['id'];
    label: string
    description?: string
    groupName?: string
    badgeable?: "Default" | "Blue" | "Green" | "Yellow" | "Red" | "Purple"
    createdAt: Date
    updatedAt: Date
}

type color = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined
export const badgeColors = new Map<string, color>([
    ["Default", "default"],
    ["Blue", "primary"],
    ["Purple", "secondary"],
    ["Green", "success"],
    ["Yellow", "warning"],
    ["Red", "danger"],
])

export interface UserData {
    id: string
    username: string
    // roles: 'admin' | 'member'
    // email: string
    created_at: Date
    updated_at: Date
}

export interface UserSessionData {
    id: string
    agent: SessionAgent
    expiresAt: Date
    createdAt: Date
}

export interface SessionAgent {
    browser?: string
    os?: string
    device?: string
}

type Cause = { username?: string; password?: string; }

export interface ServerResponseError {
    message?: string;
    cause?: Cause
}
