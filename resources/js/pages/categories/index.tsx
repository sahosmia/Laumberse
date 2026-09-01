import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormError } from '@/components/ui/form-error';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { ProductCategory as Category, ProductCategoriesIndexProps as IndexProps } from '@/types/pages/products';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Tag } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function Index({ categories, filters }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        slug: '',
        description: '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('categories.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        setShowModal(true);
    };

    const handleNameChange = (name: string) => {
        setData((d) => ({
            ...d,
            name,
            slug: name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, ''),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            setShowSaveConfirm(true);
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                    reset();
                },
                onError: () => {
                    setShowSaveConfirm(false);
                },
            });
        }
    };

    const columns: DataViewColumn<Category>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (category) => (
                <TableRowActions
                    id={category.id}
                    label={category.name}
                    edit={{ onClick: () => openEditModal(category) }}
                    deleteRoute="categories.destroy"
                />
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (category) => <div className="font-medium text-neutral-900 dark:text-neutral-100">{category.name}</div>,
        },
        {
            key: 'slug',
            label: 'Slug',
            render: (category) => <span className="text-neutral-500 dark:text-neutral-400">{category.slug}</span>,
        },
        {
            key: 'description',
            label: 'Description',
            className: 'max-w-xs truncate',
            render: (category) => <span className="text-neutral-500 dark:text-neutral-400">{category.description || '-'}</span>,
        },
    ];

    const renderCategoryCard = (category: Category) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions
                    id={category.id}
                    label={category.name}
                    edit={{ onClick: () => openEditModal(category) }}
                    deleteRoute="categories.destroy"
                />
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{category.name}</h4>
                    <p className="font-mono text-xs text-neutral-400">{category.slug}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{category.description || 'No description'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="space-y-4 p-4">
                <SaveConfirmationModal
                    isOpen={showSaveConfirm}
                    onClose={() => setShowSaveConfirm(false)}
                    onConfirm={confirmSave}
                    title="Save Category Changes"
                    description="Are you sure you want to save these changes to the category?"
                    isProcessing={processing}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Tag className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categories</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Category
                    </FormButton>
                </div>

                <DataView
                    data={categories.data}
                    getKey={(category) => category.id}
                    loading={isLoading}
                    emptyMessage="No categories found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search categories..."
                    onReset={resetDataView}
                    viewKey="product-categories"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderCategoryCard}
                    pagination={categories.links}
                    total={categories.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Category Name"
                        value={data.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        error={errors.name}
                        required
                        placeholder="e.g. Jeans, Shirts"
                    />

                    <FormInput
                        label="Slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        error={errors.slug}
                        required
                        placeholder="e.g. jeans-shirts"
                    />

                    <div className="space-y-1.5">
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[100px] w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="Brief description of the category"
                        />
                        <FormError message={errors.description} />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1">
                            {editingCategory ? 'Update Category' : 'Save Category'}
                        </FormButton>
                        <FormButton type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
