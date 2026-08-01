import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

interface IndexProps {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function Index({ categories }: IndexProps) {
    const { delete: destroy, processing } = useForm();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('categories.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="p-4 space-y-4">
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Category"
                    description="Are you sure you want to delete this category? This action cannot be undone."
                    isProcessing={processing}
                />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Categories</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage product categories</p>
                    </div>
                    <Button asChild>
                        <Link href={route('categories.create')}>
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-left px-5 py-3 font-semibold">Slug</th>
                                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-10 text-center text-neutral-400">
                                            <Tag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{category.name}</div>
                                            </td>
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                                                {category.slug}
                                            </td>
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('categories.edit', category.id)}>
                                                            <Pencil className="w-4 h-4 text-neutral-500" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
