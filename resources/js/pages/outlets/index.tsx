import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Outlet } from '@/types';
import type { OutletsIndexProps } from '@/types/pages/outlets';
import { Head, useForm } from '@inertiajs/react';
import { CircleCheck, CircleOff, Plus, Store } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Outlets',
        href: '/outlets',
    },
];

const STATUS_STYLES: Record<Outlet['status'], string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

export default function Outlets({ outlets, filters }: OutletsIndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        status: 'active' as Outlet['status'],
    });

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('outlets.index', filters, {}, 'created_at:desc', 300, { status: filters.status || '' });
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingOutlet(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (outlet: Outlet) => {
        setEditingOutlet(outlet);
        clearErrors();
        setData({
            name: outlet.name,
            code: outlet.code,
            address: outlet.address || '',
            phone: outlet.phone || '',
            email: outlet.email || '',
            status: outlet.status,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOutlet) {
            setShowSaveConfirm(true);
        } else {
            post(route('outlets.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingOutlet) {
            put(route('outlets.update', editingOutlet.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => setShowSaveConfirm(false),
            });
        }
    };

    const columns: DataViewColumn<Outlet>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (o) => <TableRowActions id={o.id} label={o.name} edit={{ onClick: () => openEditModal(o) }} />,
        },
        {
            key: 'name',
            label: 'Name',
            render: (o) => <span className="font-medium text-neutral-800 dark:text-neutral-200">{o.name}</span>,
        },
        {
            key: 'code',
            label: 'Code',
            className: 'font-mono text-xs text-neutral-500',
            render: (o) => o.code,
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (o) => o.phone || <span className="text-neutral-400 italic">—</span>,
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (o) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[o.status]}`}>{o.status}</span>
            ),
        },
    ];

    const renderOutletCard = (o: Outlet) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">{o.code}</span>
                <TableRowActions id={o.id} label={o.name} edit={{ onClick: () => openEditModal(o) }} />
            </div>
            <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">{o.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{o.phone || 'No phone number'}</p>
            </div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[o.status]}`}>{o.status}</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Outlets" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Store className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Outlets</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Outlet
                    </FormButton>
                </div>

                <DataView
                    data={outlets.data}
                    getKey={(o) => o.id}
                    loading={isLoading}
                    emptyMessage="No outlets found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or code..."
                    filters={
                        <FilterSelect
                            icon={<CircleCheck className="h-4 w-4" />}
                            containerClassName="w-full sm:w-40"
                            value={filterValues.status ?? ''}
                            onChange={(e) => setFilter('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FilterSelect>
                    }
                    onReset={resetDataView}
                    viewKey="outlets"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderOutletCard}
                    pagination={outlets.links}
                    total={outlets.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Outlet Changes"
                description="Are you sure you want to save these changes to the outlet?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingOutlet ? 'Edit Outlet' : 'New Outlet'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Outlet Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Uttara Outlet"
                        error={errors.name}
                    />
                    <FormInput
                        label="Outlet Code"
                        required
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        className="rounded-xl border-neutral-200 bg-transparent font-mono dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. UTR"
                        error={errors.code}
                        helperText="A short unique identifier for this outlet."
                    />
                    <FormInput
                        label="Address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. House 12, Road 5, Uttara, Dhaka"
                        error={errors.address}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="+880 1234 567890"
                            error={errors.phone}
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="uttara@launverse.com"
                            error={errors.email}
                        />
                    </div>

                    {editingOutlet && (
                        <FormSelect
                            label="Status"
                            icon={data.status === 'active' ? <CircleCheck className="h-4 w-4" /> : <CircleOff className="h-4 w-4" />}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as Outlet['status'])}
                            helperText="An inactive outlet is hidden from selection for new work — its history stays intact."
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FormSelect>
                    )}

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingOutlet ? 'Update Outlet' : 'Save Outlet'}
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
