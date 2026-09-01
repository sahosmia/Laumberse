import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, type CompanyLoan, type SharedData } from '@/types';
import type { CompanyLoansProps } from '@/types/pages/company-loans';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { HandCoins, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company Loans',
        href: '/company-loans',
    },
];

export default function CompanyLoans({ companyLoans, filters }: CompanyLoansProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        lender_name: '',
        initial_loan_amount: '' as string | number,
        outlet_id: '' as number | '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('company-loans.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        reset();
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('company-loans.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const columns: DataViewColumn<CompanyLoan>[] = [
        {
            key: 'lender_name',
            label: 'Lender',
            className: 'font-medium text-neutral-900 dark:text-neutral-100',
            render: (l) => l.lender_name,
        },
        {
            key: 'initial_loan_amount',
            label: 'Initial Amount',
            align: 'right',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (l) => formatCurrency(l.initial_loan_amount),
        },
        {
            key: 'current_balance',
            label: 'Current Balance',
            align: 'right',
            className: 'font-semibold text-neutral-900 dark:text-neutral-100',
            render: (l) => formatCurrency(l.current_balance),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (l) => (
                <Link href={route('company-loans.show', l.id)} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    View Ledger
                </Link>
            ),
        },
    ];

    const renderCompanyLoanCard = (l: CompanyLoan) => (
        <Link
            href={route('company-loans.show', l.id)}
            className="block space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/30"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{l.lender_name}</h4>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Initial: {formatCurrency(l.initial_loan_amount)}</p>
                </div>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(l.current_balance)}</span>
            </div>
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company Loans" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <HandCoins className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Company Loans</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Loan
                    </FormButton>
                </div>

                <DataView
                    data={companyLoans.data}
                    getKey={(l) => l.id}
                    loading={isLoading}
                    emptyMessage="No company loans found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search loans..."
                    onReset={resetDataView}
                    viewKey="company-loans"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderCompanyLoanCard}
                    pagination={companyLoans.links}
                    total={companyLoans.total}
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
                title="New Company Loan"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="lender_name"
                        label="Lender Name"
                        required
                        value={data.lender_name}
                        onChange={(e) => setData('lender_name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. ABC Bank"
                        error={errors.lender_name}
                    />
                    <FormInput
                        id="initial_loan_amount"
                        label="Initial Loan Amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={data.initial_loan_amount}
                        onChange={(e) => setData('initial_loan_amount', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="0.00"
                        error={errors.initial_loan_amount}
                    />

                    {outlet?.isAll && (
                        <FormSelect
                            id="outlet_id"
                            label="Outlet"
                            required
                            value={data.outlet_id}
                            onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                            error={errors.outlet_id}
                            helperText="Which outlet the initial loan amount belongs to."
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
                            {processing ? 'Saving...' : 'Save Loan'}
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
