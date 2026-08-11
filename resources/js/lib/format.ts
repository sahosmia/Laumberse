export function formatCurrency(n: number | string, options?: Intl.NumberFormatOptions) {
    return `৳${Number(n).toLocaleString('en-BD', options)}`;
}
