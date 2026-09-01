import { ActivityFormModal } from '@/components/activity-form-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
    CLIENT_ACTIVITY_STATUS_STYLES,
    CLIENT_ACTIVITY_TYPE_LABELS,
    CLIENT_ACTIVITY_TYPE_STYLES,
    CLIENT_TYPE_STYLES,
    INVOICE_STATUS_STYLES,
    PAYMENT_STATUS_STYLES,
    type ClientType,
} from '@/constants/status';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { toTelUrl, toWhatsAppUrl } from '@/lib/phone';
import { cn } from '@/lib/utils';
import { ClientActivity, Invoice, type BreadcrumbItem } from '@/types';
import type { ClientShowProps } from '@/types/pages/clients';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    CalendarClock,
    Check,
    CreditCard,
    History,
    Lock,
    MapPin,
    MessageCircle,
    Phone,
    Plus,
    Settings,
    ShoppingBag,
    Tag,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const typeBadgeClass = (type: ClientType) => CLIENT_TYPE_STYLES[type] ?? CLIENT_TYPE_STYLES.Consumer;

export default function ClientShow({ client, orders, activities, employees, orderFilters, activityFilters }: ClientShowProps) {
    const isLoading = useTableLoading();

    const [activeTab, setActiveTab] = useState<'orders' | 'meetings'>('orders');

    // Order History and Meetings search/paginate/filter independently, but both live on this one
    // page, so every change re-sends BOTH sections' current search/filters together — otherwise
    // changing one would wipe the other's state out of the URL query string.
    const [orderSearch, setOrderSearch] = useState(orderFilters.search || '');
    const [orderPerPage, setOrderPerPage] = useState(orderFilters.per_page || 20);
    const [orderDateFilter, setOrderDateFilter] = useState(orderFilters.date_filter || '');
    const [orderStartDate, setOrderStartDate] = useState(orderFilters.start_date || '');
    const [orderEndDate, setOrderEndDate] = useState(orderFilters.end_date || '');
    const [orderSpecificDate, setOrderSpecificDate] = useState(orderFilters.specific_date || '');
    const isOrderCustomRange = orderDateFilter === 'custom';
    const isOrderSpecificDate = orderDateFilter === 'specific_date';

    const [activitySearch, setActivitySearch] = useState(activityFilters.search || '');
    const [activityPerPage, setActivityPerPage] = useState(activityFilters.per_page || 20);
    const [activityDateFilter, setActivityDateFilter] = useState(activityFilters.date_filter || '');
    const [activityStartDate, setActivityStartDate] = useState(activityFilters.start_date || '');
    const [activityEndDate, setActivityEndDate] = useState(activityFilters.end_date || '');
    const [activitySpecificDate, setActivitySpecificDate] = useState(activityFilters.specific_date || '');
    const isActivityCustomRange = activityDateFilter === 'custom';
    const isActivitySpecificDate = activityDateFilter === 'specific_date';

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (orderSearch) params.order_search = orderSearch;
            params.order_per_page = String(orderPerPage);
            if (orderDateFilter) params.order_date_filter = orderDateFilter;
            if (isOrderCustomRange) {
                if (orderStartDate) params.order_start_date = orderStartDate;
                if (orderEndDate) params.order_end_date = orderEndDate;
            }
            if (isOrderSpecificDate && orderSpecificDate) params.order_specific_date = orderSpecificDate;

            if (activitySearch) params.activity_search = activitySearch;
            params.activity_per_page = String(activityPerPage);
            if (activityDateFilter) params.activity_date_filter = activityDateFilter;
            if (isActivityCustomRange) {
                if (activityStartDate) params.activity_start_date = activityStartDate;
                if (activityEndDate) params.activity_end_date = activityEndDate;
            }
            if (isActivitySpecificDate && activitySpecificDate) params.activity_specific_date = activitySpecificDate;

            router.get(route('clients.show', client.id), params, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        orderSearch,
        orderPerPage,
        orderDateFilter,
        orderStartDate,
        orderEndDate,
        orderSpecificDate,
        activitySearch,
        activityPerPage,
        activityDateFilter,
        activityStartDate,
        activityEndDate,
        activitySpecificDate,
    ]);

    const [showActivityModal, setShowActivityModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ClientActivity | null>(null);
    const [activityDefaultType, setActivityDefaultType] = useState<ClientActivity['type']>('meeting');

    const openCreateActivityModal = (type: ClientActivity['type'] = 'meeting') => {
        setEditingActivity(null);
        setActivityDefaultType(type);
        setShowActivityModal(true);
    };

    useEffect(() => {
        const action = new URLSearchParams(window.location.search).get('action');
        if (action === 'add-meeting' || action === 'add-follow-up') {
            setActiveTab('meetings');
            openCreateActivityModal(action === 'add-meeting' ? 'meeting' : 'follow_up');
        }
    }, []);

    const openEditActivityModal = (activity: ClientActivity) => {
        setEditingActivity(activity);
        setShowActivityModal(true);
    };

    const markActivityDone = (activity: ClientActivity) => {
        router.put(
            route('clients.activities.update', [client.id, activity.id]),
            {
                type: activity.type,
                scheduled_at: activity.scheduled_at.slice(0, 16),
                note: activity.note || '',
                employee_id: activity.employee_id || '',
                status: 'done',
                next_follow_up_date: activity.next_follow_up_date || '',
            },
            { preserveScroll: true },
        );
    };

    const orderColumns: DataViewColumn<(typeof orders.data)[number]>[] = [
        {
            key: 'invoice',
            label: 'Invoice',
            className: 'font-mono text-xs font-bold text-blue-600',
            render: (inv) => (
                <Link href={route('invoices.show', inv.id)} className="hover:underline">
                    {inv.invoice_uuid}
                </Link>
            ),
        },
        { key: 'date', label: 'Date', className: 'text-xs text-neutral-500', render: (inv) => formatDate(inv.date) },
        {
            key: 'total',
            label: 'Amount',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (inv) => formatCurrency(Number(inv.total)),
        },
        {
            key: 'paid',
            label: 'Paid',
            align: 'right',
            className: 'font-medium text-emerald-600',
            render: (inv) => formatCurrency(Number(inv.paid)),
        },
        {
            key: 'payment_status',
            label: 'Payment',
            align: 'center',
            render: (inv) => (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${PAYMENT_STATUS_STYLES[inv.payment_status]}`}>
                    {inv.payment_status}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (inv) => (
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${INVOICE_STATUS_STYLES[inv.status] || 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                >
                    {inv.status}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (inv) => (
                <TableRowActions
                    id={inv.id}
                    label={`invoice ${inv.invoice_uuid}`}
                    view={{ href: route('invoices.show', inv.id) }}
                    edit={{ href: route('invoices.edit', inv.id) }}
                    deleteRoute="invoices.destroy"
                />
            ),
        },
    ];

    const renderOrderCard = (inv: Invoice) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <Link href={route('invoices.show', inv.id)} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                    {inv.invoice_uuid}
                </Link>
                <TableRowActions
                    id={inv.id}
                    label={`invoice ${inv.invoice_uuid}`}
                    view={{ href: route('invoices.show', inv.id) }}
                    edit={{ href: route('invoices.edit', inv.id) }}
                    deleteRoute="invoices.destroy"
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">{formatDate(inv.date)}</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${PAYMENT_STATUS_STYLES[inv.payment_status]}`}>
                    {inv.payment_status}
                </span>
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${INVOICE_STATUS_STYLES[inv.status] || 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                >
                    {inv.status}
                </span>
            </div>
        </div>
    );

    const activityColumns: DataViewColumn<ClientActivity>[] = [
        {
            key: 'type',
            label: 'Type',
            render: (a) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_TYPE_STYLES[a.type]}`}>
                    {CLIENT_ACTIVITY_TYPE_LABELS[a.type]}
                </span>
            ),
        },
        { key: 'scheduled_at', label: 'Scheduled', className: 'text-xs text-neutral-500', render: (a) => formatDateTime(a.scheduled_at) },
        {
            key: 'note',
            label: 'Note',
            className: 'max-w-xs truncate text-neutral-700 dark:text-neutral-300',
            render: (a) => a.note || '—',
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (a) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_STATUS_STYLES[a.status]}`}>
                    {a.status}
                </span>
            ),
        },
        {
            key: 'who',
            label: 'Assigned / Logged by',
            className: 'text-xs text-neutral-500',
            render: (a) => (
                <>
                    {a.employee && <div>Assigned: {a.employee.name}</div>}
                    {a.creator && <div>By: {a.creator.name}</div>}
                </>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (a) => (
                <TableRowActions
                    id={[client.id, a.id]}
                    label="this activity"
                    edit={{ onClick: () => openEditActivityModal(a) }}
                    deleteRoute="clients.activities.destroy"
                    customActions={
                        a.status === 'pending' && (
                            <DropdownMenuItem onSelect={() => markActivityDone(a)}>
                                <Check className="mr-2 h-4 w-4" /> Mark Done
                            </DropdownMenuItem>
                        )
                    }
                />
            ),
        },
    ];

    const renderActivityCard = (activity: ClientActivity) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_TYPE_STYLES[activity.type]}`}>
                        {CLIENT_ACTIVITY_TYPE_LABELS[activity.type]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_STATUS_STYLES[activity.status]}`}>
                        {activity.status}
                    </span>
                </div>
                <TableRowActions
                    id={[client.id, activity.id]}
                    label="this activity"
                    edit={{ onClick: () => openEditActivityModal(activity) }}
                    deleteRoute="clients.activities.destroy"
                    customActions={
                        activity.status === 'pending' && (
                            <DropdownMenuItem onSelect={() => markActivityDone(activity)}>
                                <Check className="mr-2 h-4 w-4" /> Mark Done
                            </DropdownMenuItem>
                        )
                    }
                />
            </div>
            <p className="text-xs text-neutral-500">{formatDateTime(activity.scheduled_at)}</p>
            {activity.note && <p className="text-sm text-neutral-700 dark:text-neutral-300">{activity.note}</p>}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                {activity.employee && <span>Assigned: {activity.employee.name}</span>}
                {activity.creator && <span>Logged by: {activity.creator.name}</span>}
                {activity.reminder_minutes && <span>Reminder: {activity.reminder_minutes} min before</span>}
                {activity.next_follow_up_date && <span>Next follow-up: {formatDate(activity.next_follow_up_date)}</span>}
            </div>
        </div>
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clients', href: '/clients' },
        { title: client.name, href: `/clients/${client.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Client: ${client.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('clients.index')}
                            className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-5 w-5 text-neutral-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h1>
                            <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3" /> {client.type} Client
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${typeBadgeClass(client.type)}`}>{client.type}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Stats Overview */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <User className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h3>
                                    <p className="font-mono text-xs font-semibold text-blue-600">{client.client_uuid}</p>
                                    <p className="text-sm text-neutral-500">{client.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-neutral-400" />
                                        <span className="text-neutral-600 dark:text-neutral-300">{client.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <a
                                            href={toTelUrl(client.phone)}
                                            title="Call"
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                        </a>
                                        <a
                                            href={toWhatsAppUrl(client.phone)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="WhatsApp"
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                                    <span className="text-neutral-600 dark:text-neutral-300">{client.address || 'No address provided'}</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-500">
                                    <Lock className="h-3 w-3" /> Internal Note (staff only)
                                </p>
                                <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                    {client.internal_note || 'No internal note added.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                        <ShoppingBag className="h-3 w-3" /> Total Orders
                                    </p>
                                    <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{client.total_orders}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/10">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                        <CreditCard className="h-3 w-3" /> Total Paid
                                    </p>
                                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(Number(client.total_paid))}</p>
                                </div>
                                <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/10">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-red-600 uppercase">
                                        <Briefcase className="h-3 w-3" /> Outstanding Due
                                    </p>
                                    <p className="text-2xl font-black text-red-600">{formatCurrency(Number(client.total_due))}</p>
                                </div>
                            </div>
                        </div>

                        {client.type === 'Corporate' && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    <Settings className="h-4 w-4 text-purple-500" /> Custom Pricing Matrix
                                </h3>
                                <div className="space-y-3">
                                    {client.custom_prices?.map((cp, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50"
                                        >
                                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cp.product?.name}</span>
                                            <span className="text-xs font-bold text-blue-600">{formatCurrency(Number(cp.custom_price))}</span>
                                        </div>
                                    ))}
                                    {(!client.custom_prices || client.custom_prices.length === 0) && (
                                        <p className="py-4 text-center text-xs text-neutral-400 italic">No custom prices configured.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order History / Meetings & Follow-ups — tabbed, each a full DataView (search, grid/table toggle, pagination) */}
                    <div className="space-y-4 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-800/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('orders')}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                        activeTab === 'orders'
                                            ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                                            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                                    )}
                                >
                                    <History className="h-4 w-4" /> Order History
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('meetings')}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                        activeTab === 'meetings'
                                            ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                                            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                                    )}
                                >
                                    <CalendarClock className="h-4 w-4" /> Meetings &amp; Follow-ups
                                </button>
                            </div>
                            {activeTab === 'meetings' && (
                                <button
                                    onClick={() => openCreateActivityModal()}
                                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                </button>
                            )}
                        </div>

                        {activeTab === 'orders' ? (
                            <DataView
                                data={orders.data}
                                getKey={(inv) => inv.id}
                                loading={isLoading}
                                emptyMessage="No orders found for this client."
                                search={orderSearch}
                                onSearchChange={setOrderSearch}
                                searchPlaceholder="Search by invoice #"
                                filters={
                                    <DateFilterBar
                                        dateFilter={orderDateFilter}
                                        onDateFilterChange={setOrderDateFilter}
                                        isCustomRange={isOrderCustomRange}
                                        startDate={orderStartDate}
                                        onStartDateChange={setOrderStartDate}
                                        endDate={orderEndDate}
                                        onEndDateChange={setOrderEndDate}
                                        isSpecificDate={isOrderSpecificDate}
                                        specificDate={orderSpecificDate}
                                        onSpecificDateChange={setOrderSpecificDate}
                                    />
                                }
                                viewKey="client-orders"
                                defaultView="table"
                                columns={orderColumns}
                                renderCard={renderOrderCard}
                                pagination={orders.links}
                                total={orders.total}
                                perPage={orderPerPage}
                                onPerPageChange={setOrderPerPage}
                            />
                        ) : (
                            <DataView
                                data={activities.data}
                                getKey={(a) => a.id}
                                loading={isLoading}
                                emptyMessage="No meetings or follow-ups logged yet."
                                search={activitySearch}
                                onSearchChange={setActivitySearch}
                                searchPlaceholder="Search by note"
                                filters={
                                    <DateFilterBar
                                        dateFilter={activityDateFilter}
                                        onDateFilterChange={setActivityDateFilter}
                                        isCustomRange={isActivityCustomRange}
                                        startDate={activityStartDate}
                                        onStartDateChange={setActivityStartDate}
                                        endDate={activityEndDate}
                                        onEndDateChange={setActivityEndDate}
                                        isSpecificDate={isActivitySpecificDate}
                                        specificDate={activitySpecificDate}
                                        onSpecificDateChange={setActivitySpecificDate}
                                    />
                                }
                                viewKey="client-activities"
                                defaultView="table"
                                columns={activityColumns}
                                renderCard={renderActivityCard}
                                pagination={activities.links}
                                total={activities.total}
                                perPage={activityPerPage}
                                onPerPageChange={setActivityPerPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ActivityFormModal
                isOpen={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                activity={editingActivity}
                defaultType={activityDefaultType}
                clientId={client.id}
                employees={employees}
            />
        </AppLayout>
    );
}
