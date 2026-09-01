import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { NoteShowProps } from '@/types/pages/notes';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, FolderOpen, Pencil, RefreshCw, StickyNote, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function NoteShow({ note }: NoteShowProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Notes', href: '/notes' },
        { title: note.title, href: `/notes/${note.id}` },
    ];

    const wasEdited = note.updated_at !== note.created_at;

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('notes.destroy', note.id), {
            onSuccess: () => router.visit(route('notes.index')),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Note - ${note.title}`} />

            <div className="space-y-4 p-4 md:p-6">
                <Link
                    href={route('notes.index')}
                    className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Notes
                </Link>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
                    {/* Main content */}
                    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 bg-gradient-to-br from-blue-50/60 to-transparent p-6 md:p-8 dark:border-neutral-800 dark:from-blue-950/20">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                                    <StickyNote className="h-7 w-7 text-white" />
                                </div>
                                <h1 className="min-w-0 text-2xl leading-tight font-bold text-neutral-900 dark:text-neutral-100">{note.title}</h1>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h2 className="mb-4 text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">Details</h2>
                            {note.details ? (
                                <div
                                    className="tiptap-content text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300"
                                    dangerouslySetInnerHTML={{ __html: note.details }}
                                />
                            ) : (
                                <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-8 text-center text-sm text-neutral-400 italic dark:border-neutral-800 dark:bg-neutral-900/30">
                                    No details added.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <div className="space-y-2">
                            <Link
                                href={route('notes.index', { action: 'edit', id: note.id })}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                <Pencil className="h-3.5 w-3.5" /> Edit Note
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Note
                            </button>
                        </div>

                        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">Category</p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <FolderOpen className="h-3 w-3" /> {note.category?.name || 'No Category'}
                                </span>
                            </div>

                            <div className="space-y-1.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">Created</p>
                                <p className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Calendar className="h-3.5 w-3.5 text-neutral-400" /> {formatDate(note.created_at)}
                                </p>
                            </div>

                            {wasEdited && (
                                <div className="space-y-1.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                    <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                        Last Updated
                                    </p>
                                    <p className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                        <RefreshCw className="h-3.5 w-3.5 text-neutral-400" /> {formatDate(note.updated_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Note"
                description={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
                isProcessing={deleting}
            />
        </AppLayout>
    );
}
