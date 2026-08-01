import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Plus, Trash2, Edit3, X, Tag, Search } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, ExpenseCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';

interface ExpenseCategoriesProps {
    categories: ExpenseCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expenses',
        href: '/expenses',
    },
    {
        title: 'Categories',
        href: '/expense-categories',
    },
];

export default function ExpenseCategories({ categories }: ExpenseCategoriesProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        description: '',
    });

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (category: ExpenseCategory) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            setShowSaveConfirm(true);
        } else {
            post(route('expense-categories.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                onError: () => {
                    setShowSaveConfirm(false);
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingCategory) {
            put(route('expense-categories.update', editingCategory.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('expense-categories.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expense Categories" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Expense Categories</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage expense categories</p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Category
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-400">
                                            <Tag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((category) => (
                                        <tr key={category.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{category.name}</div>
                                            </td>
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                                                        <Edit3 className="w-4 h-4 text-neutral-500" />
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

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Category"
                description="Are you sure you want to delete this expense category? This action cannot be undone."
                isProcessing={processing}
            />

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Category Changes"
                description="Are you sure you want to save these changes to the category?"
                isProcessing={processing}
            />

            {/* Category Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Enter category name"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Enter description (optional)"
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {editingCategory ? 'Update' : 'Save'} Category
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
