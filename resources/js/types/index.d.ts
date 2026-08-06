export interface User {
    id: number;
    name: string;
    employee_id?: string | null;
    email: string;
    email_verified_at?: string;
    unit_id?: number | null;
    team?: string | null;
    role?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    notifications?: {
        unread_count: number;
        items: Array<{
            id: string;
            read_at: string | null;
            created_at: string | null;
            data: Record<string, unknown>;
        }>;
    };
};
