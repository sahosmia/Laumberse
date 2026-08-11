import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Plus, Tag, Search } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, ExpenseCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { ExpenseCategoriesProps } from '@/types/pages/expenses';

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

export default function ExpenseCategories({ categories, filters }: ExpenseCategoriesProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        description: '',
    });

    useDebouncedSearch('expense-categories.index', search);

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
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-400">
                                            <Tag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{category.name}</div>
                                            </td>
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <TableRowActions
                                                        id={category.id}
                                                        label={category.name}
                                                        edit={{ onClick: () => openEditModal(category) }}
                                                        deleteRoute="expense-categories.destroy"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={categories.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Category Changes"
                description="Are you sure you want to save these changes to the category?"
                isProcessing={processing}
            />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
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
            </Modal>
        </AppLayout>
    );
}
