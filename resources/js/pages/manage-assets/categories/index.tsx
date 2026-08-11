import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus, Tag, AlertCircle } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, AssetCategory } from '@/types';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { AssetCategoriesProps } from '@/types/pages/manage-assets';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Assets',
        href: '/manage-assets',
    },
    {
        title: 'Categories',
        href: '/asset-categories',
    },
];

export default function AssetCategories({ categories, filters }: AssetCategoriesProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        description: '',
    });

    useDebouncedSearch('asset-categories.index', search);

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (category: AssetCategory) => {
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
            post(route('asset-categories.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingCategory) {
            put(route('asset-categories.update', editingCategory.id), {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Categories" />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Asset Categories</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage categories for your assets</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.data.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 group relative overflow-hidden transition-all hover:shadow-xl">
                            <div className="absolute top-4 right-4">
                                <TableRowActions
                                    id={c.id}
                                    label={c.name}
                                    edit={{ onClick: () => openEditModal(c) }}
                                    deleteRoute="asset-categories.destroy"
                                />
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{c.name}</h4>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{c.description || 'No description'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {categories.data.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <AlertCircle className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-3" />
                            <p className="text-neutral-400">No categories found matching your search</p>
                        </div>
                    )}
                </div>

                <Pagination links={categories.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Category Changes"
                description="Are you sure you want to save these changes to the asset category?"
                isProcessing={processing}
            />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                            required
                            placeholder="e.g. Furniture, Electronics"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100 min-h-[100px]"
                            placeholder="Brief description of the category"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {editingCategory ? 'Update Category' : 'Save Category'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
