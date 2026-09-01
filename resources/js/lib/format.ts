export function formatCurrency(n: number | string, options?: Intl.NumberFormatOptions) {
    return `৳${Number(n).toLocaleString('en-BD', options)}`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats any date/datetime string (or Date) as "08 Aug, 2026" — the app-wide date display format. */
export function formatDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    return `${String(date.getDate()).padStart(2, '0')} ${MONTH_NAMES[date.getMonth()]}, ${date.getFullYear()}`;
}

/** Same as formatDate but with a time suffix, e.g. "08 Aug, 2026, 3:45 PM" — for timestamps where time matters (audit trails, etc). */
export function formatDateTime(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${formatDate(date)}, ${time}`;
}
