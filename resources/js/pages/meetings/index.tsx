import { ActivityFormModal } from '@/components/activity-form-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import {
    CLIENT_ACTIVITY_STATUSES,
    CLIENT_ACTIVITY_STATUS_STYLES,
    CLIENT_ACTIVITY_TYPES,
    CLIENT_ACTIVITY_TYPE_LABELS,
    CLIENT_ACTIVITY_TYPE_STYLES,
    type ClientActivityType,
} from '@/constants/status';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import { type BreadcrumbItem, ClientActivity } from '@/types';
import type { MeetingsIndexProps } from '@/types/pages/meetings';
import { Head } from '@inertiajs/react';
import { CalendarClock, Plus, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meetings & Follow-ups',
        href: '/meetings',
    },
];

export default function MeetingsIndex({ activities, clients, employees, filters }: MeetingsIndexProps) {
    const [dateFilter, setDateFilter] = useState(filters.date_filter || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [specificDate, setSpecificDate] = useState(filters.specific_date || '');
    const isCustomRange = dateFilter === 'custom';
    const isSpecificDate = dateFilter === 'specific_date';

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch(
        'meetings.index',
        filters,
        {
            date_filter: dateFilter,
            ...(isCustomRange ? { start_date: startDate, end_date: endDate } : {}),
            ...(isSpecificDate ? { specific_date: specificDate } : {}),
        },
        'scheduled_at:desc',
        300,
        { type: filters.type || '', status: filters.status || '' },
    );
    const isLoading = useTableLoading();

    const handleReset = () => {
        resetDataView();
        setDateFilter('');
        setStartDate('');
        setEndDate('');
        setSpecificDate('');
    };

    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityDefaultType, setActivityDefaultType] = useState<ClientActivityType>('meeting');

    const openCreateActivityModal = (type: ClientActivityType) => {
        setActivityDefaultType(type);
        setShowActivityModal(true);
    };

    useEffect(() => {
        const action = new URLSearchParams(window.location.search).get('action');
        if (action === 'add-meeting') openCreateActivityModal('meeting');
        if (action === 'add-follow-up') openCreateActivityModal('follow_up');
    }, []);

    const columns: DataViewColumn<ClientActivity & { client: { id: number; name: string } }>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (a) => (
                <TableRowActions
                    id={[a.client.id, a.id]}
                    label={`${CLIENT_ACTIVITY_TYPE_LABELS[a.type]} with ${a.client.name}`}
                    view={{ href: route('clients.show', a.client.id), label: 'Open Client' }}
                    deleteRoute="clients.activities.destroy"
                />
            ),
        },
        {
            key: 'client',
            label: 'Client',
            className: 'font-medium text-neutral-900 dark:text-neutral-100',
            render: (a) => a.client.name,
        },
        {
            key: 'type',
            label: 'Type',
            render: (a) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_TYPE_STYLES[a.type]}`}>
                    {CLIENT_ACTIVITY_TYPE_LABELS[a.type]}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (a) => (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_STATUS_STYLES[a.status]}`}>
                    {a.status}
                </span>
            ),
        },
        {
            key: 'scheduled_at',
            label: 'Date & Time',
            className: 'whitespace-nowrap text-neutral-600 dark:text-neutral-400',
            render: (a) => formatDateTime(a.scheduled_at),
        },
        {
            key: 'employee',
            label: 'Assigned',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (a) => a.employee?.name || <span className="text-neutral-400 italic">Unassigned</span>,
        },
        {
            key: 'note',
            label: 'Note',
            className: 'max-w-xs truncate text-neutral-500 dark:text-neutral-400',
            render: (a) => a.note || <span className="text-neutral-400 italic">—</span>,
        },
    ];

    const renderCard = (a: ClientActivity & { client: { id: number; name: string } }) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate font-bold text-neutral-900 dark:text-neutral-100">{a.client.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{formatDateTime(a.scheduled_at)}</p>
                </div>
                <TableRowActions
                    id={[a.client.id, a.id]}
                    label={`${CLIENT_ACTIVITY_TYPE_LABELS[a.type]} with ${a.client.name}`}
                    view={{ href: route('clients.show', a.client.id), label: 'Open Client' }}
                    deleteRoute="clients.activities.destroy"
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_TYPE_STYLES[a.type]}`}>
                    {CLIENT_ACTIVITY_TYPE_LABELS[a.type]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_STATUS_STYLES[a.status]}`}>
                    {a.status}
                </span>
            </div>
            {a.note && <p className="line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">{a.note}</p>}
            <p className="text-xs text-neutral-400">{a.employee ? `Assigned: ${a.employee.name}` : 'Unassigned'}</p>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meetings & Follow-ups" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <CalendarClock className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Meetings & Follow-ups</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openCreateActivityModal('follow_up')}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <Plus className="h-4 w-4" /> Add Follow-up
                        </button>
                        <FormButton onClick={() => openCreateActivityModal('meeting')} icon={<Plus className="h-4 w-4" />}>
                            Add Meeting
                        </FormButton>
                    </div>
                </div>

                <DataView
                    data={activities.data}
                    getKey={(a) => a.id}
                    loading={isLoading}
                    emptyMessage="No meetings or follow-ups found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by client or note..."
                    filters={
                        <>
                            <FilterSelect
                                icon={<Tag className="h-4 w-4" />}
                                containerClassName="w-full sm:w-40"
                                value={filterValues.type ?? ''}
                                onChange={(e) => setFilter('type', e.target.value)}
                            >
                                <option value="">All Types</option>
                                {CLIENT_ACTIVITY_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {CLIENT_ACTIVITY_TYPE_LABELS[t]}
                                    </option>
                                ))}
                            </FilterSelect>
                            <FilterSelect
                                icon={<User className="h-4 w-4" />}
                                containerClassName="w-full sm:w-40"
                                value={filterValues.status ?? ''}
                                onChange={(e) => setFilter('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {CLIENT_ACTIVITY_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </FilterSelect>
                            <DateFilterBar
                                dateFilter={dateFilter}
                                onDateFilterChange={setDateFilter}
                                isCustomRange={isCustomRange}
                                startDate={startDate}
                                onStartDateChange={setStartDate}
                                endDate={endDate}
                                onEndDateChange={setEndDate}
                                isSpecificDate={isSpecificDate}
                                specificDate={specificDate}
                                onSpecificDateChange={setSpecificDate}
                            />
                        </>
                    }
                    onReset={handleReset}
                    viewKey="meetings"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderCard}
                    pagination={activities.links}
                    total={activities.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <ActivityFormModal
                isOpen={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                defaultType={activityDefaultType}
                clients={clients}
                employees={employees}
            />
        </AppLayout>
    );
}
