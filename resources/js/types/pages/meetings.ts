import type { ClientActivity } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface MeetingsIndexProps {
    activities: Paginated<ClientActivity & { client: { id: number; name: string } }>;
    clients: { id: number; name: string }[];
    employees: { id: number; name: string }[];
    filters: {
        search?: string;
        type?: string;
        status?: string;
        date_filter?: string;
        start_date?: string;
        end_date?: string;
        specific_date?: string;
        sort?: string;
        per_page?: number;
    };
}
