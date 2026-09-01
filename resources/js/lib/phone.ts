/** Bangladeshi local numbers (01XXXXXXXXX) need the 88 country code and no leading 0 for a wa.me link. */
export function toWhatsAppNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) return digits;
    if (digits.startsWith('0')) return `88${digits}`;

    return digits;
}

/** wa.me deep link — opens a WhatsApp chat with the number, optionally pre-filled with a message. */
export function toWhatsAppUrl(phone: string, message?: string): string {
    const base = `https://wa.me/${toWhatsAppNumber(phone)}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** tel: link — opens the device's phone dialer with the number pre-filled. */
export function toTelUrl(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
