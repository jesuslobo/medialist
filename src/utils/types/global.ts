import { ListData } from "./list";

export interface TagData {
    id: string;
    userId: UserData['id'];
    listId: ListData['id'];
    label: string
    description?: string
    groupName?: string
    badgeable?: "Default" | "Blue" | "Green" | "Yellow" | "Red" | "Purple"
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
    // created_at
    // last_login
}

type Cause = { username?: string; password?: string; }

export interface ServerResponseError {
    message?: string;
    cause?: Cause
}
