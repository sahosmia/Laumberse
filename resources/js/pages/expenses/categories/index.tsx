import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Button } from '@/components/ui/button';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, ExpenseCategory } from '@/types';
import type { ExpenseCategoriesProps } from '@/types/pages/expenses';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Tag } from 'lucide-react';
import { useState } from 'react';

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
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('expense-categories.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (category: ExpenseCategory) => {
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

    const columns: DataViewColumn<ExpenseCategory>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (category) => (
                <TableRowActions
                    id={category.id}
                    label={category.name}
                    edit={{ onClick: () => openEditModal(category) }}
                    deleteRoute="expense-categories.destroy"
                />
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (category) => <div className="font-medium text-neutral-900 dark:text-neutral-100">{category.name}</div>,
        },
        {
            key: 'description',
            label: 'Description',
            className: 'max-w-xs truncate',
            render: (category) => <span className="text-neutral-500 dark:text-neutral-400">{category.description || '-'}</span>,
        },
    ];

    const renderCategoryCard = (category: ExpenseCategory) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions
                    id={category.id}
                    label={category.name}
                    edit={{ onClick: () => openEditModal(category) }}
                    deleteRoute="expense-categories.destroy"
                />
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{category.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{category.description || 'No description'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expense Categories" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Tag className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Expense Categories</h1>
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
                    viewKey="expense-categories"
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
                description="Are you sure you want to save these changes to the category?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="name"
                        label="Category Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter category name"
                        error={errors.name}
                    />
                    <FormInput
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Enter description (optional)"
                        error={errors.description}
                    />
                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1">
                            {processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                        </FormButton>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
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
