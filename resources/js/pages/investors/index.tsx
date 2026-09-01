import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, type Investor, type SharedData } from '@/types';
import type { InvestorsProps } from '@/types/pages/investors';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Investors',
        href: '/investors',
    },
];

export default function Investors({ investors, filters }: InvestorsProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        name: '',
        phone: '',
        opening_balance: '' as string | number,
        outlet_id: '' as number | '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('investors.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        reset();
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('investors.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const columns: DataViewColumn<Investor>[] = [
        {
            key: 'name',
            label: 'Name',
            className: 'font-medium text-neutral-900 dark:text-neutral-100',
            render: (i) => i.name,
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (i) => i.phone || <span className="text-neutral-400 italic">None</span>,
        },
        {
            key: 'current_balance',
            label: 'Current Balance',
            align: 'right',
            className: 'font-semibold text-neutral-900 dark:text-neutral-100',
            render: (i) => formatCurrency(i.current_balance),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (i) => (
                <Link href={route('investors.show', i.id)} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    View Ledger
                </Link>
            ),
        },
    ];

    const renderInvestorCard = (i: Investor) => (
        <Link
            href={route('investors.show', i.id)}
            className="block space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/30"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{i.name}</h4>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{i.phone || 'No phone'}</p>
                </div>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(i.current_balance)}</span>
            </div>
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Investors" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Users className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Investors</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Investor
                    </FormButton>
                </div>

                <DataView
                    data={investors.data}
                    getKey={(i) => i.id}
                    loading={isLoading}
                    emptyMessage="No investors found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search investors..."
                    onReset={resetDataView}
                    viewKey="investors"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderInvestorCard}
                    pagination={investors.links}
                    total={investors.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title="New Investor"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="name"
                        label="Investor Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Jane Doe"
                        error={errors.name}
                    />
                    <FormInput
                        id="phone"
                        label="Phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. 01700000000"
                        error={errors.phone}
                    />
                    <FormInput
                        id="opening_balance"
                        label="Opening Balance"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.opening_balance}
                        onChange={(e) => setData('opening_balance', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="0.00"
                        error={errors.opening_balance}
                    />

                    {outlet?.isAll && (
                        <FormSelect
                            id="outlet_id"
                            label="Outlet"
                            required
                            value={data.outlet_id}
                            onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                            error={errors.outlet_id}
                            helperText="Which outlet the opening balance belongs to."
                        >
                            <option value="">Select an outlet</option>
                            {outlet.available.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </FormSelect>
                    )}

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : 'Save Investor'}
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
