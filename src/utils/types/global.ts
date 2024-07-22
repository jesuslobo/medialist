export interface TagData {
    id: string;
    list_id?: string;
    name: string
    description?: string
    group_name?: string
    badgeable?: boolean
}

export interface UserData {
    id: string
    username: string
    roles: 'admin' | 'member'
    email: string
    // created_at
    // last_login
}