import type { Note, NoteCategory } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface NotesProps {
    notes: Paginated<Note>;
    categories: NoteCategory[];
    filters: { search?: string; note_category_id?: string; sort?: string; per_page?: number };
}

export interface NoteCategoriesProps {
    categories: Paginated<NoteCategory>;
    filters: { search?: string; sort?: string; per_page?: number };
}

export interface NoteShowProps {
    note: Note;
}
