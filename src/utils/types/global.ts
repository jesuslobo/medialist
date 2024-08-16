import { ListData } from "./list";

export interface TagData {
    id: string;
    userId: UserData['id'];
    listId: ListData['id'];
    label: string
    description?: string
    groupName?: string
    badgeable?: boolean
  }

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
