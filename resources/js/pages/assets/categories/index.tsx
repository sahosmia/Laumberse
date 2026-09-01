import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, AssetCategory } from '@/types';
import type { AssetCategoriesProps } from '@/types/pages/assets';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Tag } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assets',
        href: '/assets',
    },
    {
        title: 'Categories',
        href: '/asset-categories',
    },
];

export default function AssetCategories({ categories, filters }: AssetCategoriesProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('asset-categories.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (category: AssetCategory) => {
        setEditingCategory(category);
        clearErrors();
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

    const columns: DataViewColumn<AssetCategory>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (c) => (
                <TableRowActions id={c.id} label={c.name} edit={{ onClick: () => openEditModal(c) }} deleteRoute="asset-categories.destroy" />
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (c) => <span className="font-medium text-neutral-800 dark:text-neutral-200">{c.name}</span>,
        },
        {
            key: 'description',
            label: 'Description',
            render: (c) => <span className="text-neutral-500 dark:text-neutral-400">{c.description || '-'}</span>,
        },
    ];

    const renderCategoryCard = (c: AssetCategory) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions id={c.id} label={c.name} edit={{ onClick: () => openEditModal(c) }} deleteRoute="asset-categories.destroy" />
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{c.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{c.description || 'No description'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asset Categories" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Tag className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Asset Categories</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Category
                    </FormButton>
                </div>

                <DataView
                    data={categories.data}
                    getKey={(c) => c.id}
                    loading={isLoading}
                    emptyMessage="No categories found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search categories..."
                    onReset={resetDataView}
                    viewKey="asset-categories"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderCategoryCard}
                    pagination={categories.links}
                    total={categories.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Category Changes"
                description="Are you sure you want to save these changes to the asset category?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingCategory ? 'Edit Category' : 'New Category'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Category Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Furniture, Electronics"
                        error={errors.name}
                    />
                    <div className="space-y-1">
                        <FormLabel>Description</FormLabel>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[100px] w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="Brief description of the category"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
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
