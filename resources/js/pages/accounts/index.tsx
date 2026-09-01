import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type Account, type BreadcrumbItem, SharedData } from '@/types';
import type { AccountsProps } from '@/types/pages/accounts';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Landmark, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: '/accounts',
    },
];

export default function Accounts({ accounts, allAccounts, filters }: AccountsProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        name: '',
        account_number: '',
        opening_balance: '' as string | number,
        outlet_id: '' as number | '',
    });

    const {
        data: editData,
        setData: setEditData,
        put: putAccount,
        reset: resetEdit,
        errors: editErrors,
        processing: editProcessing,
        clearErrors: clearEditErrors,
    } = useForm({
        name: '',
        account_number: '',
    });

    const {
        data: transferData,
        setData: setTransferData,
        post: postTransfer,
        reset: resetTransfer,
        errors: transferErrors,
        processing: transferProcessing,
        clearErrors: clearTransferErrors,
    } = useForm({
        from_account_id: '' as string | number,
        to_account_id: '' as string | number,
        amount: '' as string | number,
        date: new Date().toISOString().split('T')[0],
        note: '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('accounts.index', filters);
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        reset();
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('accounts.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        clearEditErrors();
        setEditData({
            name: account.name,
            account_number: account.account_number || '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount) return;
        putAccount(route('accounts.update', editingAccount.id), {
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
            },
        });
    };

    const openTransferModal = () => {
        resetTransfer();
        clearTransferErrors();
        setShowTransferModal(true);
    };

    const handleTransferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postTransfer(route('account-transfers.store'), {
            onSuccess: () => {
                setShowTransferModal(false);
                resetTransfer();
            },
        });
    };

    const columns: DataViewColumn<Account>[] = [
        {
            key: 'name',
            label: 'Name',
            className: 'font-medium text-neutral-900 dark:text-neutral-100',
            render: (a) => a.name,
        },
        {
            key: 'account_number',
            label: 'Account Number',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (a) => a.account_number || <span className="text-neutral-400 italic">None</span>,
        },
        {
            key: 'current_balance',
            label: 'Current Balance',
            align: 'right',
            className: 'font-semibold text-neutral-900 dark:text-neutral-100',
            render: (a) => formatCurrency(a.current_balance),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (a) => (
                <TableRowActions
                    id={a.id}
                    label={a.name}
                    view={{ href: route('accounts.show', a.id), label: 'View Ledger' }}
                    edit={{ onClick: () => openEditModal(a) }}
                />
            ),
        },
    ];

    const renderAccountCard = (a: Account) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <Link href={route('accounts.show', a.id)} className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{a.name}</h4>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{a.account_number || 'No account number'}</p>
                </Link>
                <TableRowActions
                    id={a.id}
                    label={a.name}
                    view={{ href: route('accounts.show', a.id), label: 'View Ledger' }}
                    edit={{ onClick: () => openEditModal(a) }}
                />
            </div>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(a.current_balance)}</p>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Landmark className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Accounts</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openTransferModal}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            Transfer Funds
                        </button>
                        <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                            Add Account
                        </FormButton>
                    </div>
                </div>

                <DataView
                    data={accounts.data}
                    getKey={(a) => a.id}
                    loading={isLoading}
                    emptyMessage="No accounts found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search accounts..."
                    onReset={resetDataView}
                    viewKey="accounts"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderAccountCard}
                    pagination={accounts.links}
                    total={accounts.total}
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
                title="New Account"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="name"
                        label="Account Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Main Cash Account"
                        error={errors.name}
                    />
                    <FormInput
                        id="account_number"
                        label="Account Number"
                        value={data.account_number}
                        onChange={(e) => setData('account_number', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. ACC-001"
                        error={errors.account_number}
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
                        <div className="space-y-1">
                            <FormLabel required>Outlet</FormLabel>
                            <FormSelect
                                value={data.outlet_id}
                                onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                                required
                            >
                                <option value="">Select an outlet</option>
                                {outlet.available.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.outlet_id && <p className="text-xs text-red-500">{errors.outlet_id}</p>}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : 'Save Account'}
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

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    clearEditErrors();
                }}
                title="Edit Account"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <FormInput
                        id="edit_name"
                        label="Account Name"
                        required
                        value={editData.name}
                        onChange={(e) => setEditData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Main Cash Account"
                        error={editErrors.name}
                    />
                    <FormInput
                        id="edit_account_number"
                        label="Account Number"
                        value={editData.account_number}
                        onChange={(e) => setEditData('account_number', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. ACC-001"
                        error={editErrors.account_number}
                    />

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={editProcessing} className="flex-1 rounded-xl">
                            {editProcessing ? 'Saving...' : 'Save Changes'}
                        </FormButton>
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                clearEditErrors();
                            }}
                            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showTransferModal}
                onClose={() => {
                    setShowTransferModal(false);
                    clearTransferErrors();
                }}
                title="Transfer Funds"
            >
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                    <FormSelect
                        id="from_account_id"
                        label="From Account"
                        required
                        value={transferData.from_account_id}
                        onChange={(e) => setTransferData('from_account_id', e.target.value ? Number(e.target.value) : '')}
                        error={transferErrors.from_account_id}
                    >
                        <option value="">Select Account</option>
                        {allAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} — {formatCurrency(a.current_balance)}
                            </option>
                        ))}
                    </FormSelect>

                    <FormSelect
                        id="to_account_id"
                        label="To Account"
                        required
                        value={transferData.to_account_id}
                        onChange={(e) => setTransferData('to_account_id', e.target.value ? Number(e.target.value) : '')}
                        error={transferErrors.to_account_id}
                    >
                        <option value="">Select Account</option>
                        {allAccounts
                            .filter((a) => a.id !== transferData.from_account_id)
                            .map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} — {formatCurrency(a.current_balance)}
                                </option>
                            ))}
                    </FormSelect>

                    <FormInput
                        id="transfer_amount"
                        label="Amount"
                        required
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={transferData.amount}
                        onChange={(e) => setTransferData('amount', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="0.00"
                        error={transferErrors.amount}
                    />

                    <FormInput
                        id="transfer_date"
                        label="Date"
                        required
                        type="date"
                        value={transferData.date}
                        onChange={(e) => setTransferData('date', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        error={transferErrors.date}
                    />

                    <div className="space-y-1.5">
                        <FormLabel htmlFor="transfer_note">Note</FormLabel>
                        <textarea
                            id="transfer_note"
                            value={transferData.note}
                            onChange={(e) => setTransferData('note', e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            rows={2}
                            placeholder="Optional note"
                        />
                        {transferErrors.note && <p className="text-xs text-red-500">{transferErrors.note}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={transferProcessing} className="flex-1 rounded-xl">
                            {transferProcessing ? 'Transferring...' : 'Transfer'}
                        </FormButton>
                        <button
                            type="button"
                            onClick={() => {
                                setShowTransferModal(false);
                                clearTransferErrors();
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
