export const DATE_FILTERS = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'previous_week', label: 'Previous Week' },
    { value: 'specific_date', label: 'Specific Date' },
    { value: 'custom', label: 'Custom Range' },
] as const;

export type DateFilter = (typeof DATE_FILTERS)[number]['value'];
