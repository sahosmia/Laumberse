import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Note } from '@/types';
import type { NotesProps } from '@/types/pages/notes';
import { Head, useForm } from '@inertiajs/react';
import { FolderOpen, Plus, StickyNote, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notes',
        href: '/notes',
    },
];

/** Strips HTML tags for the card preview — the editor's own markup should never be rendered outside its own controlled instance. */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export default function Notes({ notes, categories, filters }: NotesProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        title: '',
        details: '',
        note_category_id: '' as string | number,
    });

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('notes.index', filters, {}, 'created_at:desc', 300, { note_category_id: filters.note_category_id || '' });
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingNote(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        clearErrors();
        setData({
            title: note.title,
            details: note.details || '',
            note_category_id: note.note_category_id ?? '',
        });
        setShowModal(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('id');
        if (params.get('action') === 'edit' && editId) {
            const note = notes.data.find((n) => n.id === Number(editId));
            if (note) openEditModal(note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNote) {
            setShowSaveConfirm(true);
        } else {
            post(route('notes.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingNote) {
            put(route('notes.update', editingNote.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => {
                    setShowSaveConfirm(false);
                },
            });
        }
    };

    const columns: DataViewColumn<Note>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (note) => (
                <TableRowActions
                    id={note.id}
                    label={note.title}
                    view={{ href: route('notes.show', note.id) }}
                    edit={{ onClick: () => openEditModal(note) }}
                    deleteRoute="notes.destroy"
                />
            ),
        },
        {
            key: 'title',
            label: 'Title',
            render: (note) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <StickyNote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{note.title}</span>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (note) => (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {note.category?.name || 'No Category'}
                </span>
            ),
        },
        {
            key: 'details',
            label: 'Details',
            className: 'max-w-xs truncate text-neutral-500 dark:text-neutral-400',
            render: (note) => (note.details && stripHtml(note.details)) || <span className="text-neutral-400 italic">No details</span>,
        },
    ];

    const renderNoteCard = (note: Note) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions
                    id={note.id}
                    label={note.title}
                    view={{ href: route('notes.show', note.id) }}
                    edit={{ onClick: () => openEditModal(note) }}
                    deleteRoute="notes.destroy"
                />
            </div>
            <div className="mb-3 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <StickyNote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 pr-8">
                    <h4 className="truncate font-bold text-neutral-900 dark:text-neutral-100">{note.title}</h4>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Tag className="h-3 w-3" /> {note.category?.name || 'No Category'}
                    </p>
                </div>
            </div>

            {note.details && stripHtml(note.details) && (
                <p className="line-clamp-4 text-sm text-neutral-500 dark:text-neutral-400">{stripHtml(note.details)}</p>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notes" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <StickyNote className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notes</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Note
                    </FormButton>
                </div>

                <DataView
                    data={notes.data}
                    getKey={(note) => note.id}
                    loading={isLoading}
                    emptyMessage="No notes found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search notes..."
                    filters={
                        <FilterSelect
                            icon={<FolderOpen className="h-4 w-4" />}
                            containerClassName="w-full sm:w-56"
                            value={filterValues.note_category_id ?? ''}
                            onChange={(e) => setFilter('note_category_id', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </FilterSelect>
                    }
                    onReset={resetDataView}
                    viewKey="notes"
                    defaultView="card"
                    columns={columns}
                    renderCard={renderNoteCard}
                    pagination={notes.links}
                    total={notes.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Note Changes"
                description="Are you sure you want to save these changes to the note?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingNote ? 'Edit Note' : 'New Note'}
                size="3xl"
            >
                <p className="-mt-4 mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                    {editingNote ? 'Update the details below.' : 'Capture something your team should remember.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
                        <FormInput
                            id="title"
                            label="Title"
                            required
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="e.g. Supplier meeting follow-up"
                            error={errors.title}
                        />

                        <FormSelect
                            id="note_category_id"
                            label="Category"
                            required
                            icon={<FolderOpen className="h-4 w-4" />}
                            value={data.note_category_id}
                            onChange={(e) => setData('note_category_id', e.target.value)}
                            error={errors.note_category_id}
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </FormSelect>
                    </div>

                    <RichTextEditor
                        id="details"
                        label="Details"
                        value={data.details}
                        onChange={(html) => setData('details', html)}
                        placeholder="Write the note details here..."
                        error={errors.details}
                    />

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                        </FormButton>
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
                            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
