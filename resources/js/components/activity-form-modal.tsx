import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CLIENT_ACTIVITY_TYPES, CLIENT_ACTIVITY_TYPE_LABELS } from '@/constants/status';
import { type ClientActivity, type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface ActivityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Present when editing an existing meeting/follow-up; omit to create a new one. */
    activity?: ClientActivity | null;
    /** Which type to preselect when creating (ignored while editing). */
    defaultType?: ClientActivity['type'];
    /** A fixed client (e.g. from that client's own page) — hides the client picker entirely. */
    clientId?: number;
    /** Client picker options, used only when `clientId` isn't given. */
    clients?: { id: number; name: string }[];
    employees: { id: number; name: string }[];
}

/**
 * Single-form create/edit for a meeting or follow-up (a ClientActivity). Reused from the client's
 * own page (clientId fixed, no picker) and from the Meetings & Follow-ups list / Quick Create
 * (no fixed client — the picker below is part of this same form, not a separate step/page).
 */
export function ActivityFormModal({
    isOpen,
    onClose,
    activity = null,
    defaultType = 'meeting',
    clientId,
    clients,
    employees,
}: ActivityFormModalProps) {
    const { outlet } = usePage<SharedData>().props;
    const isEditing = !!activity;
    const showClientPicker = !isEditing && !clientId;

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        client_id: (clientId ?? '') as number | '',
        type: defaultType,
        scheduled_at: new Date().toISOString().slice(0, 16),
        note: '',
        employee_id: '' as string | number,
        status: 'pending' as ClientActivity['status'],
        next_follow_up_date: '',
        reminder_minutes: '' as string | number,
        outlet_id: '' as number | '',
    });

    // Re-seed the form every time the modal opens, for either a fresh create or the activity being edited.
    useEffect(() => {
        if (!isOpen) return;
        clearErrors();

        if (activity) {
            setData({
                client_id: clientId ?? activity.client_id,
                type: activity.type,
                scheduled_at: activity.scheduled_at.slice(0, 16),
                note: activity.note || '',
                employee_id: activity.employee_id || '',
                status: activity.status,
                next_follow_up_date: activity.next_follow_up_date || '',
                reminder_minutes: activity.reminder_minutes ?? '',
                outlet_id: '',
            });
        } else {
            reset();
            setData((prev) => ({ ...prev, client_id: clientId ?? '', type: defaultType }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeClientId = isEditing ? (activity?.client_id ?? clientId) : data.client_id;
        if (!routeClientId) return;

        const onSuccess = () => onClose();

        if (isEditing && activity) {
            put(route('clients.activities.update', [routeClientId, activity.id]), { onSuccess });
        } else {
            post(route('clients.activities.store', routeClientId), { onSuccess });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Activity' : 'Add Meeting / Follow-up'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {showClientPicker && (
                    <div className="space-y-1.5">
                        <FormLabel required>Client</FormLabel>
                        <SearchableSelect
                            options={(clients ?? []).map((c) => ({ label: c.name, value: c.id }))}
                            value={data.client_id}
                            onChange={(val) => setData('client_id', Number(val))}
                            placeholder="Search clients..."
                        />
                        {errors.client_id && <p className="text-xs text-red-500">{errors.client_id}</p>}
                    </div>
                )}

                <FormSelect
                    id="type"
                    label="Type"
                    required
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value as ClientActivity['type'])}
                    error={errors.type}
                >
                    {CLIENT_ACTIVITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {CLIENT_ACTIVITY_TYPE_LABELS[type]}
                        </option>
                    ))}
                </FormSelect>

                <FormInput
                    id="scheduled_at"
                    label="Date & Time"
                    type="datetime-local"
                    required
                    // A new meeting/follow-up can't be scheduled in the past — matches
                    // StoreClientActivityRequest's after_or_equal:now rule. Not applied while
                    // editing, since fixing details on an already-past activity is normal.
                    min={isEditing ? undefined : new Date().toISOString().slice(0, 16)}
                    value={data.scheduled_at}
                    onChange={(e) => setData('scheduled_at', e.target.value)}
                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                    error={errors.scheduled_at}
                />

                <FormSelect
                    id="employee_id"
                    label="Assigned Staff"
                    value={data.employee_id}
                    onChange={(e) => setData('employee_id', e.target.value)}
                    error={errors.employee_id}
                >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}
                        </option>
                    ))}
                </FormSelect>

                <div className="space-y-1.5">
                    <FormLabel htmlFor="note">Note</FormLabel>
                    <textarea
                        id="note"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        rows={3}
                    />
                    {errors.note && <p className="text-xs text-red-500">{errors.note}</p>}
                </div>

                <FormInput
                    id="next_follow_up_date"
                    label="Next Follow-up Date (Optional)"
                    type="date"
                    value={data.next_follow_up_date}
                    onChange={(e) => setData('next_follow_up_date', e.target.value)}
                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                    error={errors.next_follow_up_date}
                />

                <FormSelect
                    id="reminder_minutes"
                    label="Reminder"
                    value={data.reminder_minutes}
                    onChange={(e) => setData('reminder_minutes', e.target.value)}
                    error={errors.reminder_minutes}
                >
                    <option value="">No reminder</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                </FormSelect>

                {!isEditing && outlet?.isAll && (
                    <FormSelect
                        id="outlet_id"
                        label="Outlet"
                        required
                        value={data.outlet_id}
                        onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                        error={errors.outlet_id}
                    >
                        <option value="">Select an outlet</option>
                        {outlet.available.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </FormSelect>
                )}

                {isEditing && (
                    <FormSelect
                        id="status"
                        label="Status"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value as ClientActivity['status'])}
                    >
                        <option value="pending">Pending</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                    </FormSelect>
                )}

                <div className="flex gap-2 pt-2">
                    <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                        {processing ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                    </FormButton>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}
