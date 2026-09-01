import { Pagination } from '@/components/ui/pagination';
import { CLIENT_ACTIVITY_STATUS_STYLES, CLIENT_ACTIVITY_TYPE_LABELS, CLIENT_ACTIVITY_TYPE_STYLES } from '@/constants/status';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { formatDate, formatDateTime } from '@/lib/format';
import type { PortalActivitiesProps } from '@/types/pages/portal';
import { Head } from '@inertiajs/react';

export default function PortalActivities({ activities }: PortalActivitiesProps) {
    return (
        <ClientPortalLayout>
            <Head title="Meetings & Follow-ups" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Meetings & Follow-ups</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">History and upcoming check-ins for your account</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {activities.data.map((activity) => (
                            <div key={activity.id} className="space-y-1 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_TYPE_STYLES[activity.type]}`}
                                    >
                                        {CLIENT_ACTIVITY_TYPE_LABELS[activity.type]}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLIENT_ACTIVITY_STATUS_STYLES[activity.status]}`}
                                    >
                                        {activity.status}
                                    </span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {formatDateTime(activity.scheduled_at)}
                                    </span>
                                </div>
                                {activity.note && <p className="text-sm text-neutral-700 dark:text-neutral-300">{activity.note}</p>}
                                {activity.next_follow_up_date && (
                                    <p className="text-xs text-neutral-400">Next follow-up: {formatDate(activity.next_follow_up_date)}</p>
                                )}
                            </div>
                        ))}
                        {activities.data.length === 0 && (
                            <p className="px-5 py-10 text-center text-xs text-neutral-400 italic">No meetings or follow-ups yet.</p>
                        )}
                    </div>
                </div>
                <Pagination links={activities.links} />
            </div>
        </ClientPortalLayout>
    );
}
